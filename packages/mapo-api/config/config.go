package config

import (
	"os"
	"strconv"
)

var SQLite3Filepath string
var Port int

func Initialize() error {
	SQLite3Filepath = EnvWithDefault("MAPO_API_SQLITE3_FILEPATH", "./data/mapo-api.db")

	portStr := EnvWithDefault("MAPO_API_PORT", "3000")
	portNum, err := strconv.Atoi(portStr)
	if err != nil {
		return err
	}
	Port = portNum

	return nil
}

func EnvWithDefault(key string, def string) string {
	val := os.Getenv(key)
	if val == "" {
		return def
	}
	return val
}
