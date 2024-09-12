// No http
package folders

var folders = []Folder{
	{ID: 0, UserID: "0", Name: "thane", ParentID: 0},
	{ID: 1, UserID: "1", Name: "billy", ParentID: 1},
}

type FolderService struct {
}

func NewFolderService() *FolderService {
	return &FolderService{}
}

func (s *FolderService) GetFolders() ([]Folder, error) {
	return folders, nil
}

func (s *FolderService) InsertFolder(id int, userId string, name string, parentId int) (*Folder, error) {
	folder := Folder{
		ID:       id,
		UserID:   userId,
		Name:     name,
		ParentID: parentId,
	}
	folders = append(folders, folder)

	return &folder, nil
}
