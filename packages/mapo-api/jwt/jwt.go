package jwt

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/bensivo/mapo/packages/mapo-api/config"
	"github.com/bensivo/mapo/packages/mapo-api/users"
	"github.com/golang-jwt/jwt/v5"
)

// JwtService provides functions for validating JWT tokens, and extracting user data from them
//
// It also provides an wrapper function WithJwtAuth(), which enforces JWT authorizataion on a standard HTTP handler.
type JwtService struct {
	userService *users.UserService
}

func NewJwtService(userService *users.UserService) *JwtService {
	return &JwtService{userService: userService}
}

// Mimics http.HandlerFunc, but with an additional parameter for user information
type AuthenticatedHttpHandler func(w http.ResponseWriter, r *http.Request, user *users.User)

// WithJWTAuth is a middleware function that enforces JWT authorization on a standard HTTP handler.
// It parses Bearer tokens from the Authorization header, validates them, and extracts user information
//
// If the token is valid, it will include user information in the given http handler.
// If the token is not valid, it will never call the given http handler.
func (s *JwtService) WithJWTAuth(handler AuthenticatedHttpHandler) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		token := r.Header.Get("Authorization")
		if token == "" {
			fmt.Println("No token provided")
			http.Error(w, "No token provided", http.StatusUnauthorized)
			return
		}

		token = strings.TrimPrefix(token, "Bearer ")
		jwtUserData, err := ValidateToken(token)
		if err != nil {
			fmt.Println("Invalid token")
			http.Error(w, "Invalid token", http.StatusUnauthorized)
			return
		}

		fmt.Printf("Verified token: %s(%s)\n", jwtUserData.Subject, jwtUserData.Email)

		user, err := s.userService.GetUser(jwtUserData.Subject)
		if err == users.ErrUserNotFound {
			fmt.Printf("User %s not found, inserting\n", jwtUserData.Subject)
			user, err = s.userService.InsertUser(jwtUserData.Subject, jwtUserData.Email, "")
		}
		if err != nil {
			fmt.Println("Failed to get user", err)
			http.Error(w, "Failed to get user", http.StatusInternalServerError)
			return
		}

		fmt.Printf("Authorization passed for user %s(%s)\n", user.ID, user.Email)
		handler(w, r, user)
	}
}

// Fields that are extracted from Supabase JWT tokens
type JwtData struct {
	Subject string
	Email   string
}

func ValidateToken(token string) (*JwtData, error) {
	parser := jwt.NewParser(
		jwt.WithIssuer(config.JwtIssuer),
		jwt.WithAudience(config.JwtAudience),
		jwt.WithValidMethods([]string{"HS256"}),
	)

	type Claims struct {
		jwt.RegisteredClaims
		Email string `json:"email"`
	}
	var claims Claims

	tokenData, err := parser.ParseWithClaims(token, &claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(config.JwtSecret), nil
	})
	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	if !tokenData.Valid {
		return nil, fmt.Errorf("token is invalid")
	}

	return &JwtData{
		Subject: claims.Subject,
		Email:   claims.Email,
	}, nil
}
