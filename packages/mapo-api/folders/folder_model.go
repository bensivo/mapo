package folders

type Folder struct {
	ID       int    `json:"id"`
	UserID   string `json:"userId"`
	Name     string `json:"name"`
	ParentID int    `json:"parentId"`
}
