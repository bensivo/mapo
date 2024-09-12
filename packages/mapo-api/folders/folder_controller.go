package folders

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/bensivo/mapo/packages/mapo-api/util"
)

type HTTPFolderController struct {
	svc *FolderService
}

func NewHttpFolderController(svc *FolderService) *HTTPFolderController {
	return &HTTPFolderController{
		svc: svc,
	}
}

func (c *HTTPFolderController) Register(mux *http.ServeMux) {
	fmt.Println("Registering route GET /folders")
	mux.HandleFunc("GET /folders", util.WithLogger(c.onGetFolders))

	fmt.Println("Registering route POST /folders")
	mux.HandleFunc("POST /folders", util.WithLogger(c.onPostFolders))
}

// GET /folders
func (c *HTTPFolderController) onGetFolders(w http.ResponseWriter, r *http.Request) {
	//1. Read all the inputs from the http request
	//2. Call service
	folders, _ := c.svc.GetFolders()
	///3. Return the response in JSON
	util.WriteJSON(w, folders)
}

// POST /folders
func (c *HTTPFolderController) onPostFolders(w http.ResponseWriter, r *http.Request) {
	var requestBody struct {
		ID       int    `json:"id"` // In reality, the DB would generate the Id, so it wouldn't be here
		UserID   string `json:"userId"`
		Name     string `json:"name"`
		ParentID int    `json:"parentId"`
	}

	bytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(bytes, &requestBody)
	if err != nil {
		http.Error(w, "Failed to parse request body JSON", http.StatusBadRequest)
		return
	}

	folder, err := c.svc.InsertFolder(requestBody.ID, requestBody.UserID, requestBody.Name, requestBody.ParentID)
	if err != nil {
		http.Error(w, "Failed to insert folder into database", http.StatusBadRequest)
		return
	}

	util.WriteJSON(w, folder)
}

// curl --request GET http://localhost:3000/folders
// curl --request POST http://localhost:3000/folders --header "Content-Type: application/json" --data '{"id":2,"userId":"2","name":"alice","parentId":2}'
// curl --request GET http://localhost:3000/folders
