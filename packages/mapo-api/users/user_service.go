package users

import (
	"database/sql"
	"fmt"
)

var (
	ErrUserNotFound = fmt.Errorf("user not found")
)

// UserService contains basic CRUD operations for users
type UserService struct {
	db *sql.DB
}

func NewUserService(db *sql.DB) *UserService {
	return &UserService{
		db: db,
	}
}

func (s *UserService) InsertUser(id string, email string, displayName string) (*User, error) {
	row := s.db.QueryRow(`
		INSERT INTO users (id, email, display_name) VALUES ($1, $2, $3) RETURNING *;
	`, id, email, displayName)

	var data struct {
		ID          string
		Email       string
		DisplayName string
	}
	err := row.Scan(&data.ID, &data.Email, &data.DisplayName)
	if err != nil {
		return nil, fmt.Errorf("failed to insert user: %w", err)
	}

	return &User{
		ID:          data.ID,
		Email:       data.Email,
		DisplayName: data.DisplayName,
	}, nil
}

func (s *UserService) GetUser(id string) (*User, error) {
	row := s.db.QueryRow(`
		SELECT id, email, COALESCE(display_name, '') FROM users WHERE id = $1;
	`, id)

	var data struct {
		ID          string
		Email       string
		DisplayName string
	}
	err := row.Scan(&data.ID, &data.Email, &data.DisplayName)
	if err == sql.ErrNoRows {
		return nil, ErrUserNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &User{
		ID:          data.ID,
		Email:       data.Email,
		DisplayName: data.DisplayName,
	}, nil
}
