package db

import (
	"database/sql"

	"github.com/bensivo/mapo/packages/mapo-api/config"
	_ "github.com/lib/pq"
)

func ConnectPostgres() (*sql.DB, error) {
	return sql.Open("postgres", config.PostgresConnectionString)
}
