package files

// file_service.go
//
// Contains FileService, responsible for interacting with the sql database to perform CRUD operations on user files.
//

import (
	"database/sql"
	"fmt"

	"github.com/bensivo/mapo/packages/mapo-api/db"
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
func (s *FileService) InsertFile(userID string, name string, contentBase64 string, folder_id int) (*File, error) {

	row := s.db.QueryRow(`
		INSERT INTO files (user_id, name, content_base64, folder_id) 
		VALUES ($1, $2, $3, NULLIF($4, 0)) 
		RETURNING id, user_id, name, content_base64, folder_id;
	`, userID, name, contentBase64, folder_id)

	var data struct {
		ID            int
		UserID        string
		Name          string
		ContentBase64 string
		FolderId      sql.NullInt64
	}

	err := row.Scan(&data.ID, &data.UserID, &data.Name, &data.ContentBase64, &data.FolderId)
	if err != nil {
		return nil, fmt.Errorf("failed to scan insert response: %w", err)
	}

	return &File{
		ID:            data.ID,
		UserID:        data.UserID,
		Name:          data.Name,
		ContentBase64: data.ContentBase64,
		FolderID:      db.WithDefaultInt64(data.FolderId, 0),
	}, nil
}

// Get all files from the database
func (s *FileService) GetFiles(userID string) ([]File, error) {
	rows, err := s.db.Query(`
		SELECT id, user_id, name, content_base64, folder_id FROM files where user_id = $1;
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get files: %w", err)
	}
	defer rows.Close()

	files := []File{}
	for rows.Next() {
		var data struct { // Although right now this type matches File, it's a good idea to keep them separate, in case the db schema changes
			ID            int
			UserID        string
			Name          string
			ContentBase64 string
			FolderId      sql.NullInt64
		}
		err := rows.Scan(&data.ID, &data.UserID, &data.Name, &data.ContentBase64, &data.FolderId)
		if err != nil {
			return nil, err
		}

		files = append(files, File{
			ID:            data.ID,
			UserID:        data.UserID,
			Name:          data.Name,
			ContentBase64: data.ContentBase64,
			FolderID:      db.WithDefaultInt64(data.FolderId, 0),
		})
	}

	return files, nil
}

// Get a single file from the Database, by its ID
// returns a nil pointer if the file does not exist
func (s *FileService) GetFile(userID string, fileID int) (*File, error) {
	row := s.db.QueryRow(`
		SELECT id, user_id, name, content_base64, folder_id FROM files WHERE user_id = $1 and id = $2;
	`, userID, fileID)

	var data struct { // Although right now this type matches File, it's a good idea to keep them separate, in case the db schema changes
		ID            int
		UserID        string
		Name          string
		ContentBase64 string
		FolderId      sql.NullInt64
	}
	err := row.Scan(&data.ID, &data.UserID, &data.Name, &data.ContentBase64, &data.FolderId)

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
		FolderID:      db.WithDefaultInt64(data.FolderId, 0),
	}, nil
}

// Update a file in the database
// Only updates fields that are not empty
func (s *FileService) UpdateFile(fileID int, userID string, name string, contentBase64 string, folderId int) error {
	existing, err := s.GetFile(userID, fileID)
	if err == ErrFileNotFound {
		return err
	}

	if err != nil {
		return fmt.Errorf("failed to get file for update: %w", err)
	}

	if existing.UserID != userID {
		return fmt.Errorf("file does not belong to user")
	}

	// Set the new value to the existing one, then overwrite any non-zero / non-empty values
	updated := existing
	if name != "" {
		updated.Name = name
	}
	if contentBase64 != "" {
		updated.ContentBase64 = contentBase64
	}
	if folderId != 0 {
		updated.FolderID = folderId
	}

	// Write our new value to the database
	_, err = s.db.Exec(`
		UPDATE files SET user_id = $1, name = $2, content_base64 = $3, folder_id = NULLIF($4, 0) WHERE id = $5;
	`, updated.UserID, updated.Name, updated.ContentBase64, folderId, fileID)
	if err != nil {
		return fmt.Errorf("failed to update file: %w", err)
	}

	return nil
}

// Remove a file from the database
func (s *FileService) DeleteFile(userID string, fileID int) error {

	_, err := s.GetFile(userID, fileID)
	if err == ErrFileNotFound {
		return err
	}

	_, err = s.db.Exec(`
		DELETE FROM files WHERE user_id = $1 and id = $2;
	`, userID, fileID)
	if err != nil {
		return fmt.Errorf("failed to remove file: %w", err)
	}

	return nil
}
