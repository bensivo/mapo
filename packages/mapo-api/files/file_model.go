package files

import "fmt"

type File struct {
	ID            int
	UserID        string
	Name          string
	ContentBase64 string
}

func (f File) String() string {
	return fmt.Sprintf("File{ id: %d, user_id: %s, name: %s, content: %s}", f.ID, f.UserID, f.Name, f.ContentBase64)
}
