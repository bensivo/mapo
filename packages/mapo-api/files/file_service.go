package files

// file_service.go
//
// Contains FileService, responsible for interacting with the sql database to perform CRUD operations on user files.
//

import (
	"database/sql"
	"fmt"
)

type FileService struct {
	db *sql.DB
}

var (
	ErrFileNotFound = fmt.Errorf("file not found")
)

func NewFileService(db *sql.DB) *FileService {
	return &FileService{db: db}
}

// Insert a file into the database
func (s *FileService) InsertFile(userID int, name string, contentBase64 string) (*File, error) {

	row := s.db.QueryRow(`
		INSERT INTO files (user_id, name, content_base64) VALUES (?, ?, ?) RETURNING *;
	`, 1, name, contentBase64)

	var data struct {
		ID            int
		UserID        int
		Name          string
		ContentBase64 string
	}
	err := row.Scan(&data.ID, &data.UserID, &data.Name, &data.ContentBase64)
	if err != nil {
		return nil, fmt.Errorf("failed to scan insert response: %w", err)
	}

	return &File{
		ID:            data.ID,
		UserID:        data.UserID,
		Name:          data.Name,
		ContentBase64: data.ContentBase64,
	}, nil
}

// Get all files from the database
func (s *FileService) GetFiles() ([]File, error) {
	rows, err := s.db.Query(`
		SELECT id, user_id, name, content_base64 FROM files;
	`)
	if err != nil {
		return nil, fmt.Errorf("failed to get files: %w", err)
	}
	defer rows.Close()

	files := []File{}
	for rows.Next() {
		var data struct { // Although right now this type matches File, it's a good idea to keep them separate, in case the db schema changes
			ID            int
			UserID        int
			Name          string
			ContentBase64 string
		}
		err := rows.Scan(&data.ID, &data.UserID, &data.Name, &data.ContentBase64)
		if err != nil {
			return nil, err
		}

		files = append(files, File{
			ID:            data.ID,
			UserID:        data.UserID,
			Name:          data.Name,
			ContentBase64: data.ContentBase64,
		})
	}

	return files, nil
}

// Get a single file from the Database, by its ID
// returns a nil pointer if the file does not exist
func (s *FileService) GetFile(fileID int) (*File, error) {
	row := s.db.QueryRow(`
		SELECT id, user_id, name, content_base64 FROM files WHERE id = ?;
	`, fileID)

	var data struct { // Although right now this type matches File, it's a good idea to keep them separate, in case the db schema changes
		ID            int
		UserID        int
		Name          string
		ContentBase64 string
	}
	err := row.Scan(&data.ID, &data.UserID, &data.Name, &data.ContentBase64)

	if err == sql.ErrNoRows {
		return nil, ErrFileNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get file: %w", err)
	}

	return &File{
		ID:            data.ID,
		UserID:        data.UserID,
		Name:          data.Name,
		ContentBase64: data.ContentBase64,
	}, nil
}

// Update a file in the database
// Only updates fields that are not empty
func (s *FileService) UpdateFile(fileID int, userID int, name string, contentBase64 string) error {
	existing, err := s.GetFile(fileID)
	if err == ErrFileNotFound {
		return err
	}

	if err != nil {
		return fmt.Errorf("failed to get file for update: %w", err)
	}

	// Set the new value to the existing one, then overwrite any non-zero / non-empty values
	updated := existing
	if userID != 0 {
		updated.UserID = userID
	}
	if name != "" {
		updated.Name = name
	}
	if contentBase64 != "" {
		updated.ContentBase64 = contentBase64
	}

	// Write our new value to the database
	_, err = s.db.Exec(`
		UPDATE files SET user_id = ?, name = ?, content_base64 = ? WHERE id = ?;
	`, updated.UserID, updated.Name, updated.ContentBase64, fileID)
	if err != nil {
		return fmt.Errorf("failed to update file: %w", err)
	}

	return nil
}

// Remove a file from the database
func (s *FileService) DeleteFile(fileID int) error {
	_, err := s.db.Exec(`
		DELETE FROM files WHERE id = ?;
	`, fileID)
	if err != nil {
		return fmt.Errorf("failed to remove file: %w", err)
	}

	return nil
}
