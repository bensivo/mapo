package config

import (
	"errors"
	"os"
	"strconv"
)

var PostgresConnectionString string
var Port int
var JwtAudience string
var JwtIssuer string
var JwtSecret string

// Initialize reads environment variables and sets global config values appropriately.
//
// It also does some basic validation on the env variables, to early-exit if some are missing
func Initialize() error {
	PostgresConnectionString = os.Getenv("POSTGRES_CONNECTION_STRING")

	portStr := EnvWithDefault("MAPO_API_PORT", "3000")
	portNum, err := strconv.Atoi(portStr)
	if err != nil {
		return err
	}
	Port = portNum

	JwtAudience = os.Getenv("JWT_AUDIENCE")
	JwtIssuer = os.Getenv("JWT_ISSUER")
	JwtSecret = os.Getenv("JWT_SECRET")

	if PostgresConnectionString == "" || JwtAudience == "" || JwtIssuer == "" || JwtSecret == "" {
		return errors.New("env vars: POSTGRES_CONNECTION_STRING, JWT_AUDIENCE, JWT_ISSUER, and JWT_SECRET must be set")
	}

	return nil
}

func EnvWithDefault(key string, def string) string {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	return val
}
