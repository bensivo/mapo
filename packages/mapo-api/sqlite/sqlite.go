package sqlite

import (
	"database/sql"
	"errors"
	"fmt"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

func Connect() (*sql.DB, error) {
	return sql.Open("sqlite3", "./mapo.db")
}

type Migration struct {
	Name string
	SQL  string
}

func RunMigrations(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS migrations (
			name TEXT PRIMARY KEY,
			ts INTEGER
		);
	`)
	fmt.Println("Migrations table initialized")

	migrations := []Migration{
		{
			Name: "create_users",
			SQL: `
			CREATE TABLE IF NOT EXISTS users (
				id INTEGER PRIMARY KEY,
				name TEXT
			);
			`,
		},
		{
			Name: "create_files",
			SQL: `
			CREATE TABLE IF NOT EXISTS files (
				id INTEGER PRIMARY KEY,
				user_id INTEGER,
				name TEXT,
				content_base64 TEXT,
				FOREIGN KEY(user_id) REFERENCES users(id)
			);
			`,
		},
		{
			Name: "seed_test_user", // TODO: remove this later
			SQL: `
				INSERT INTO users (id, name) VALUES (1, 'testuser');
			`,
		},
	}

	for _, migration := range migrations {
		err := RunMigration(db, migration)
		if err != nil {
			return fmt.Errorf("failed to run migration: %w", err)
		}
	}
	return err
}

func RunMigration(db *sql.DB, migration Migration) error {
	row := db.QueryRow("SELECT count(*) as count FROM migrations WHERE name = ?;", migration.Name)
	var rowData struct {
		Count int
	}
	err := row.Scan(&rowData.Count)
	if err != nil {
		return fmt.Errorf("failed to query migrations table: %w", err)
	}

	if rowData.Count > 0 {
		fmt.Printf("Migration %s already run\n", migration.Name)
		return nil
	}

	fmt.Printf("Running migration: %s\n\t%s\n", migration.Name, migration.SQL)
	return WithTx(db, func(tx *sql.Tx) error {
		_, err = tx.Exec(migration.SQL)
		if err != nil {
			return fmt.Errorf("failed to execute migration: %w", err)
		}

		_, err = tx.Exec(
			"INSERT INTO migrations (name, ts) VALUES (?, ?);",
			migration.Name,
			time.Now().Unix(),
		)

		return err
	})

	// tx, err := db.Begin()
	// if err != nil {
	// 	return fmt.Errorf("failed to start transaction: %w", err)
	// }

	// if err != nil {
	// 	tx.Rollback()
	// 	fmt.Println(err)
	// 	return fmt.Errorf("failed to execute migration: %w", err)
	// }

	// err = tx.Commit()
	// if err != nil {
	// 	// TODO: do we need to rollback if the commit failed?
	// 	fmt.Println(err)
	// 	return fmt.Errorf("failed to commit migration: %w", err)
	// }

	// return nil
}

// Source: https://www.reddit.com/r/golang/comments/18flz7z/defer_rollback_and_committing_a_transaction_in_a/
func WithTx(db *sql.DB, fn func(tx *sql.Tx) error) error {
	txn, err := db.Begin()
	if err != nil {
		return err
	}
	err = fn(txn)
	if err != nil {
		err2 := txn.Rollback()
		return errors.Join(err, err2)
	}
	return txn.Commit()
}
