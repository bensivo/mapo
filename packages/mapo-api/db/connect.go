package db

import (
	"database/sql"

	"github.com/bensivo/mapo/packages/mapo-api/config"
	_ "github.com/lib/pq"
)

func ConnectPostgres() (*sql.DB, error) {
	database, err := sql.Open("postgres", config.PostgresConnectionString)
	if err != nil {
		return nil, err
	}

	// Prevents concurrent queries from interfering with each-other
	//
	// Even though many resources online say that sql.DB is safe for concurrent use, when I try it, I get errors.
	// Starting a second query before calling rows.Close() on the first one gives me an error, it sends the data from one query
	// to the Scan function of the other
	//
	// May be able to get around this by switching to pgx and the pgxpool abstraction?
	//
	// See: https://github.com/lib/pq/issues/81#issuecomment-2359931431
	database.SetMaxOpenConns(1)

	return database, nil
}
