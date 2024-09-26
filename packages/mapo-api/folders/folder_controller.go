package folders

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/bensivo/mapo/packages/mapo-api/jwt"
	"github.com/bensivo/mapo/packages/mapo-api/users"
	"github.com/bensivo/mapo/packages/mapo-api/util"
)

type HTTPFolderController struct {
	svc *FolderService
	jwt *jwt.JwtService
}

func NewHttpFolderController(svc *FolderService, jwt *jwt.JwtService) *HTTPFolderController {
	return &HTTPFolderController{
		svc,
		jwt,
	}
}

func (c *HTTPFolderController) Register(mux *http.ServeMux) {
	//need to add users to post
	fmt.Println("Registering route POST /folders")
	mux.HandleFunc("POST /folders", util.WithLogger(c.jwt.WithJWTAuth(c.onPostFolders)))

	fmt.Println("Registering route GET /folders")
	mux.HandleFunc("GET /folders", util.WithLogger(c.jwt.WithJWTAuth(c.onGetFolders)))

	//added by me today
	fmt.Println("Registering route GET /folders/{folderid}")
	mux.HandleFunc("GET /folders/{folderid}", util.WithLogger(c.jwt.WithJWTAuth(c.onGetFolder)))

	fmt.Println("Registering route PATCH /folders/{folderid}")
	mux.HandleFunc("PATCH /folders/{folderid}", util.WithLogger(c.jwt.WithJWTAuth(c.onPatchFolder)))

	fmt.Println("Registering route DELETE /folders/{folderid}")
	mux.HandleFunc("DELETE /folders/{folderid}", util.WithLogger(c.jwt.WithJWTAuth(c.onDeleteFolder)))
}

// GET all /folders
func (c *HTTPFolderController) onGetFolders(w http.ResponseWriter, r *http.Request, user *users.User) {
	//1. Read all the inputs from the http request
	//2. Call service
	folders, err := c.svc.GetFolders(user.ID)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to get folders", http.StatusInternalServerError)
		return
	}
	//3. Return the response in JSON
	util.WriteJSON(w, folders)
}

// GET one /folder
func (c *HTTPFolderController) onGetFolder(w http.ResponseWriter, r *http.Request, user *users.User) {
	//1. Get folder id from the URL path
	folderID, err := util.GetIntPathParam(r, "folderid")

	//err
	if err != nil {
		http.Error(w, "Failed to parse folder ID", http.StatusBadRequest)
		return
	}

	//call getfolder service
	folder, err := c.svc.GetFolder(user.ID, folderID)

	//err
	if err == ErrFolderNotFound {
		msg := fmt.Sprintf("Failed to get folder %s", err)
		fmt.Println(msg)
		http.Error(w, msg, http.StatusBadRequest)
		return
	}
	if err != nil {
		msg := fmt.Sprintf("Failed to get folder %s", err)
		fmt.Println(msg)
		http.Error(w, msg, http.StatusInternalServerError)
		return
	}

	//return the retrieved folder as a JSON response with 200 OK status
	util.WriteJSON(w, folder)
}

// POST /folders
func (c *HTTPFolderController) onPostFolders(w http.ResponseWriter, r *http.Request, user *users.User) {
	var requestBody struct {
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

	//err here requestBody.ID,
	folder, err := c.svc.InsertFolder(user.ID, requestBody.Name, requestBody.ParentID)
	if err != nil {
		fmt.Printf("Failed to insert folder into database: %s\n", err)
		http.Error(w, "Failed to insert folder into database", http.StatusBadRequest)
		return
	}

	util.WriteJSON(w, folder)
}

// PATCH /folders
func (c *HTTPFolderController) onPatchFolder(w http.ResponseWriter, r *http.Request, user *users.User) {
	//1. Read the Request
	var requestBody struct {
		Name     string `json:"name"`
		ParentID int    `json:"parent_id"`
	}
	err := util.ReadJSONRequestBody(r, &requestBody)
	//err
	if err != nil {
		fmt.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	//get folderid from path
	folderID, err := util.GetIntPathParam(r, "folderid")
	//err
	if err != nil {
		http.Error(w, "Failed to parse folder ID", http.StatusBadRequest)
		return
	}
	//3. call the service method
	err = c.svc.UpdateFolder(folderID, user.ID, requestBody.Name, requestBody.ParentID)
	//err
	if err == ErrFolderNotFound {
		http.Error(w, "Folder not found", http.StatusNotFound)
		return
	}
	if err != nil {
		msg := fmt.Sprintf("failed to update folder: %s", err)
		fmt.Println(msg)
		http.Error(w, msg, http.StatusInternalServerError)
		return
	}
	util.WriteJSON(w, map[string]string{"status": "ok"})
}

// DELETE /folders
func (c *HTTPFolderController) onDeleteFolder(w http.ResponseWriter, r *http.Request, user *users.User) {
	//get folderid from path
	folderID, err := util.GetIntPathParam(r, "folderid")
	//err
	if err != nil {
		http.Error(w, "Failed to parse folder ID", http.StatusBadRequest)
		return
	}

	// Call service
	err = c.svc.DeleteFolder(user.ID, folderID)
	if err == ErrFolderNotFound {
		http.Error(w, "Folder not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "Failed to delete folder", http.StatusInternalServerError)
		return
	}

	// Return response
	util.WriteJSON(w, map[string]string{"status": "ok"})
}

//write down how to run this again :(

// curl --request GET http://localhost:3000/folders
// curl --request POST http://localhost:3000/folders --header "Content-Type: application/json" --data '{"id":2,"userId":"2","name":"alice","parentId":2}'
// curl --request GET http://localhost:3000/folders
