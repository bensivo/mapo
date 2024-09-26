// No http
package folders

import (
	"database/sql"
	"fmt"

	"github.com/bensivo/mapo/packages/mapo-api/db"
)

/* var folders = []Folder{
	{ID: 0, UserID: "0", Name: "thane", ParentID: 0},
	{ID: 1, UserID: "1", Name: "billy", ParentID: 1},
} */

type FolderService struct {
	db *sql.DB
}

var (
	ErrFolderNotFound = fmt.Errorf("folder not found")
)

// insert db connection here
func NewFolderService(db *sql.DB) *FolderService {
	return &FolderService{db: db}
}

// Insert a folder into the database
func (s *FolderService) InsertFolder(userID string, name string, parentID int) (*Folder, error) {
	//this needs to be connecting to the SQL database instead of Folder
	row := s.db.QueryRow(`
		INSERT INTO folders (user_id, name, parent_id) 
		VALUES ($1, $2, NULLIF($3, 0)) 
		RETURNING id, user_id, name, parent_id;
	`, userID, name, parentID)

	var data struct {
		ID       int
		UserID   string
		Name     string
		ParentID sql.NullInt64
	}

	err := row.Scan(&data.ID, &data.UserID, &data.Name, &data.ParentID)
	if err != nil {
		fmt.Println(err)
		return nil, fmt.Errorf("failed to scan insert response: %w", err)
	}

	return &Folder{
		ID:       data.ID,
		UserID:   data.UserID,
		Name:     data.Name,
		ParentID: db.WithDefaultInt64(data.ParentID, 0),
	}, nil

}

// Get a single folder from the database
// Return nil if folder doesnt exist
func (s *FolderService) GetFolder(userID string, folderID int) (*Folder, error) {
	row := s.db.QueryRow(`
		SELECT id, user_id, name, parent_id FROM folders WHERE user_id = $1 and id = $2;
	`, userID, folderID)

	var data struct {
		ID       int
		UserID   string
		Name     string
		ParentID sql.NullInt64
	}

	err := row.Scan(&data.ID, &data.UserID, &data.Name, &data.ParentID)

	if err == sql.ErrNoRows {
		return nil, ErrFolderNotFound
	}

	if err != nil {
		return nil, fmt.Errorf("failed to get folder: %w", err)
	}

	var parentIdInt int
	if data.ParentID.Valid {
		parentIdInt = int(data.ParentID.Int64)
	} else {
		parentIdInt = 0
	}

	return &Folder{
		ID:       data.ID,
		UserID:   data.UserID,
		Name:     data.Name,
		ParentID: parentIdInt,
	}, nil
}

// Get all folders from the database
func (s *FolderService) GetFolders(userID string) ([]Folder, error) {
	rows, err := s.db.Query(`
		SELECT id, user_id, name, parent_id FROM folders WHERE user_id=$1;
	`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get folders: %w", err)
	}
	defer rows.Close()

	folders := []Folder{}
	for rows.Next() {
		var id int
		var user_id string
		var name string
		var parent_id sql.NullInt64

		err := rows.Scan(&id, &user_id, &name, &parent_id)
		if err != nil {
			return nil, err
		}

		var pid int
		if parent_id.Valid {
			pid = int(parent_id.Int64)
		} else {
			pid = 0
		}

		folders = append(folders, Folder{
			ID:       id,
			UserID:   user_id,
			Name:     name,
			ParentID: pid,
		})
	}
	return folders, nil
}

// Update a folder in the database
// Only updates fields that are not empty
func (s *FolderService) UpdateFolder(folderID int, userID string, name string, parentID int) error {
	existing, err := s.GetFolder(userID, folderID)

	if err == ErrFolderNotFound {
		return err
	}

	if err != nil {
		return fmt.Errorf("failed to get folder for update: %w", err)
	}

	if existing.UserID != userID {
		return fmt.Errorf("folder does not belong to user")
	}

	updated := existing

	if name != "" {
		updated.Name = name
	}

	if parentID != 0 {
		updated.ParentID = parentID
	}

	//use SQL command to update in the database
	_, err = s.db.Exec(`
		UPDATE folders SET user_id = $1, name = $2, parent_id = NULLIF($3, 0) WHERE id = $4;
	`, updated.UserID, updated.Name, updated.ParentID, folderID)

	if err != nil {
		return fmt.Errorf("failed to update folder: %w", err)
	}

	//returns nil if successful
	return nil
}

// Remove a folder in the database
func (s *FolderService) DeleteFolder(userID string, folderID int) error {

	_, err := s.GetFolder(userID, folderID)
	if err == ErrFolderNotFound {
		return err
	}

	_, err = s.db.Exec(`
		DELETE FROM folders WHERE user_id = $1 and id = $2;
	`, userID, folderID)

	if err != nil {
		return fmt.Errorf("failed to remove folder: %w", err)
	}

	//returns nil if successful
	return nil
}
