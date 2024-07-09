package files

import "fmt"

type File struct {
	ID            int    `json:"id"`
	UserID        string `json:"userId"`
	Name          string `json:"name"`
	ContentBase64 string `json:"contentBase64"`
}

func (f File) String() string {
	return fmt.Sprintf("File{ id: %d, user_id: %s, name: %s, content: %s}", f.ID, f.UserID, f.Name, f.ContentBase64)
}
