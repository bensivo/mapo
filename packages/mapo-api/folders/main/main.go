package main

import (
	"fmt"

	"github.com/bensivo/mapo/packages/mapo-api/folders"
)

func main() {

	service := folders.NewFolderService()

	folders, _ := service.GetFolders()

	fmt.Printf("Number of folders: %d\n", len(folders))

	newFolder, _ := service.InsertFolder(1, "thane", "thane's folder", 0)
	fmt.Printf("New Folder name: %s\n", newFolder.Name)
	newFolder, _ = service.InsertFolder(1, "thane", "thane's folder", 0)
	fmt.Printf("New Folder name: %s\n", newFolder.Name)
	newFolder, _ = service.InsertFolder(1, "thane", "thane's folder", 0)
	fmt.Printf("New Folder name: %s\n", newFolder.Name)

	folders, _ = service.GetFolders()
	fmt.Printf("Number of folders: %d\n", len(folders))
}
