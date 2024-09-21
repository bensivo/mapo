package files

import "fmt"

type File struct {
	ID            int    `json:"id"`
	UserID        string `json:"userId"`
	Name          string `json:"name"`
	ContentBase64 string `json:"contentBase64"`
	FolderID      int    `json:"folderId"` // NOTE: We use -1 to represent the root folder, but there's no real entry with that id
}

func (f File) String() string {
	return fmt.Sprintf("File{ id: %d, user_id: %s, name: %s, content: %s}", f.ID, f.UserID, f.Name, f.ContentBase64)
}
