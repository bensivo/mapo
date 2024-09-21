// No http
package folders

import (
	"database/sql"
	"fmt"

	"github.com/bensivo/mapo/packages/mapo-api/db"
)

var folders = []Folder{
	{ID: 0, UserID: "0", Name: "thane", ParentID: 0},
	{ID: 1, UserID: "1", Name: "billy", ParentID: 1},
}

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
func (s *FolderService) InsertFolder(userId string, name string, parentId int) (*Folder, error) {
	row := s.db.QueryRow(`
		INSERT INTO folders (user_id, name, parent_id)
		VALUES ($1, $2, NULLIF($3, 0))
		RETURNING id, user_id, name, parent_id;
	`, userId, name, parentId)

	var data struct {
		ID       int
		UserID   string
		Name     string
		ParentID sql.NullInt64
	}

	err := row.Scan(&data.ID, &data.UserID, &data.Name, &data.ParentID)
	if err != nil {
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
func (s *FolderService) GetFolder() ([]Folder, error) {
	//use a SQL Query like insert that SELECTS all folders with the ID given
	//row := s.db.QueryRow (`SELECT ? WHERE user_id=$1 AND id=$2;`, userID, folderID)

	//create a temp struct to hold data from query

	//use Scan feature to scan from current row into the struct
	//err := rows.Scan(&struct.type)
	//error message if scan fails
	//error message if query returns no rows, meaning folder was not found

	//return a pointer to a new folder instance populated with scanned data

	return folders, nil
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
func (s *FolderService) UpdateFolder() error {
	//retrieve existing file
	//existing, err = s.GetFile(userID, fileID)

	//error handling x3

	//create a copy of the folder to update with new values
	//update name
	//update contentBase64

	//use SQL command to update in the database
	//_, err = s.db.Exec(`UPDATE folders SET user_id=$1, name=$2, content_base64=$3 WHERE id=$4;`, updated.UserID, ...)
	//err handling

	//returns nil if successful
	return nil
}

// Remove a folder in the database
func (s *FolderService) DeleteFolder() error {
	//retrieve folder with user id
	//_, err := s.GetFolder(userID, folderID)
	//err handling

	//use a SQL command to delete a folder from the database
	//_, err = s.db.Exec(`DELETE FROM folders WHERE user_id = $1 AND id=$2;`, userID, folderID)
	//err handling

	//returns nil if successful
	return nil
}
