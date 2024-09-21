package folders

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	//eventually add jwt for auth

	"github.com/bensivo/mapo/packages/mapo-api/jwt"
	"github.com/bensivo/mapo/packages/mapo-api/users"
	"github.com/bensivo/mapo/packages/mapo-api/util"
)

type HTTPFolderController struct {
	svc *FolderService
	//add jwt for user auth
	jwt *jwt.JwtService
}

func NewHttpFolderController(svc *FolderService, jwt *jwt.JwtService) *HTTPFolderController {
	return &HTTPFolderController{
		svc,
		jwt,
		//add jwt for user auth
	}
}

func (c *HTTPFolderController) Register(mux *http.ServeMux) {
	fmt.Println("Registering route GET /folders")
	mux.HandleFunc("GET /folders", util.WithLogger(c.jwt.WithJWTAuth(c.onGetFolders)))

	//need to add users to post
	fmt.Println("Registering route POST /folders")
	mux.HandleFunc("POST /folders", util.WithLogger(c.jwt.WithJWTAuth(c.onPostFolders)))
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
func (c *HTTPFolderController) onGetFolder(w http.ResponseWriter, r *http.Request) {
	//1. Get folder id from the URL path
	/*
		folderIDStr := r.PathValue("folderid")
		folderID, err := strconv.Atoi(folderIDStr)
		if err != nil {
			http.Error(w, "Failed to parse folder ID", http.StatusBadRequest)
			return
		}
		//call the GetFolder service
		//TODO: params
		folder, err := c.svc.GetFolder()
		if err == ErrFolderNotFound {
			http.Error(w, "Folder not found", http.StatusBadRequest)
			return
		}
		if err != nil {
			http.Error(w, "Failed to get folder", http.StatusInternalServerError)
			return
		}

		//return the retrieved folder as a JSON response with 200 OK status
		util.WriteJSON(w, folder)
	*/
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

	folder, err := c.svc.InsertFolder(user.ID, requestBody.Name, requestBody.ParentID)
	if err != nil {
		http.Error(w, "Failed to insert folder into database", http.StatusBadRequest)
		return
	}

	util.WriteJSON(w, folder)
}

// PATCH /folders
func (c *HTTPFolderController) onPatchFolder(w http.ResponseWriter, r *http.Request) {
	//Steps:
	//1. Read the Request
	/*
		var data struct {
			Name          string `json:"name"`
			ContextBase64 string `json:"contentbase64"`
		}
		bytes, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}
		//2. Parse the JSON
		err = json.Unmarshal(bytes, &data)
		if err != nil {
			http.Error(w, "Failed to parse JSON request body", http.StatusBadRequest)
			return
		}
		idStr := r.PathValue("folderid")
		folderID, err := strconv.Atoi(idStr)
		if err != nil {
			http.Error(w, "Failed to parse folder ID", http.StatusBadRequest)
			return
		}
		//3. call the service method
		//TODO: params
		err = c.svc.UpdateFolder()
		if err == ErrFolderNotFound {
			http.Error(w, "Folder not found", http.StatusNotFound)
			return
		}
		if err != nil {
			http.Error(w, "Failed to update folder", http.StatusInternalServerError)
			return
		}
		util.WriteJSON(w, map[string]string{
			"status": "ok",
		})
	*/
}

// DELETE /folders
func (c *HTTPFolderController) onDeleteFolder(w http.ResponseWriter, r *http.Request) {

	// //Steps:
	// //1. Get folder Id from the URL path params
	// idStr := r.PathValue("folderid")
	// folderID, err := strconv.Atoi(idStr)
	// if err != nil {
	// 	http.Error(w, "Failed to parse folder ID", http.StatusBadRequest)
	// 	return
	// }
	// //2. Call the service to delete the file using ids
	// err = c.svc.DeleteFolder()
	// //what is the point of this?
	// if err == ErrFolderNotFound {
	// 	http.Error(w, "File not found", http.StatusNotFound)
	// 	return
	// }
	// if err != nil {
	// 	http.Error(w, "Failed to delete file", http.StatusInternalServerError)
	// 	return
	// }
	// //4. Return a JSON response
	// util.WriteJSON(w, map[string]string{"status": "ok"})
}

// curl --request GET http://localhost:3000/folders
// curl --request POST http://localhost:3000/folders --header "Content-Type: application/json" --data '{"id":2,"userId":"2","name":"alice","parentId":2}'
// curl --request GET http://localhost:3000/folders
