package db

import "database/sql"

// WithDefaultInt64 fetches the valueo of NullInt64 with a default on nulls
func WithDefaultInt64(d sql.NullInt64, def int) int {
	if d.Valid {
		return int(d.Int64)
	}
	return def
}
