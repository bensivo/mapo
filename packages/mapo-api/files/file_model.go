package files

import "fmt"

//
// The model package stores all the core data structures and types used throughout the application
//

type File struct {
	ID            int
	UserID        int
	Name          string
	ContentBase64 string
}

func (f File) String() string {
	return fmt.Sprintf("File{ id: %d, user_id: %d, name: %s, content: %s}", f.ID, f.UserID, f.Name, f.ContentBase64)
}
