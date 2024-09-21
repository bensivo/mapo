package files

// http_file_controller.go
//
// This file contains the HTTP routes which map to the FileService, including basic REST API CRUD operations.
// Anything specific to HTTP is performed here (parsing request bodies, HTTP request paths, writing responses in JSON format, etc.)

import (
	"fmt"
	"net/http"

	"github.com/bensivo/mapo/packages/mapo-api/jwt"
	"github.com/bensivo/mapo/packages/mapo-api/users"
	"github.com/bensivo/mapo/packages/mapo-api/util"
)

type HTTPFileController struct {
	svc *FileService
	jwt *jwt.JwtService
}

func NewHttpFileController(svc *FileService, jwt *jwt.JwtService) *HTTPFileController {
	return &HTTPFileController{
		svc,
		jwt,
	}
}

func (c *HTTPFileController) Register(mux *http.ServeMux) {
	fmt.Println("Registering routes from HTTPFileController")

	fmt.Println("Registering route POST /files")
	mux.HandleFunc("POST /files", util.WithLogger(c.jwt.WithJWTAuth(c.onPostFile)))

	fmt.Println("Registering route GET /files")
	mux.HandleFunc("GET /files", util.WithLogger(c.jwt.WithJWTAuth(c.onGetFiles)))

	fmt.Println("Registering route GET /files/{fileid}")
	mux.HandleFunc("GET /files/{fileid}", util.WithLogger(c.jwt.WithJWTAuth(c.onGetFile)))

	fmt.Println("Registering route PATCH /files/{fileid}")
	mux.HandleFunc("PATCH /files/{fileid}", util.WithLogger(c.jwt.WithJWTAuth(c.onUpdateFile)))

	fmt.Println("Registering route DELETE /files/{fileid}")
	mux.HandleFunc("DELETE /files/{fileid}", util.WithLogger(c.jwt.WithJWTAuth(c.onDeleteFile)))
}

func (c *HTTPFileController) onPostFile(w http.ResponseWriter, r *http.Request, user *users.User) {
	// Parse the request body
	var requestBody struct {
		Name          string `json:"name"`
		ContextBase64 string `json:"contentBase64"`
		FolderID      int    `json:"folderId"`
	}
	err := util.ReadJSONRequestBody(r, &requestBody)
	if err != nil {
		fmt.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Call service
	file, err := c.svc.InsertFile(user.ID, requestBody.Name, requestBody.ContextBase64, requestBody.FolderID)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to insert file", http.StatusInternalServerError)
		return
	}

	// Return response
	util.WriteJSON(w, file)
}

func (c *HTTPFileController) onGetFiles(w http.ResponseWriter, r *http.Request, user *users.User) {
	// Call service
	files, err := c.svc.GetFiles(user.ID)

	// Translate errors to HTTP error codes
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to get files", http.StatusInternalServerError)
		return
	}

	// Define a struct for the JSON response
	util.WriteJSON(w, files)
}

func (c *HTTPFileController) onGetFile(w http.ResponseWriter, r *http.Request, user *users.User) {
	// Get File ID from path
	fileID, err := util.GetIntPathParam(r, "fileid")
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to parse file ID", http.StatusBadRequest)
		return
	}

	// Call service
	file, err := c.svc.GetFile(user.ID, fileID)

	// Translate errors to HTTP error codes
	if err == ErrFileNotFound {
		fmt.Println(err)
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to get file", http.StatusInternalServerError)
		return
	}

	util.WriteJSON(w, file)

}
func (c *HTTPFileController) onUpdateFile(w http.ResponseWriter, r *http.Request, user *users.User) {
	// Parse the request body
	var requestBody struct {
		Name          string `json:"name"`
		ContextBase64 string `json:"contentBase64"`
		FolderID      int    `json:"folderId"`
	}
	err := util.ReadJSONRequestBody(r, &requestBody)
	if err != nil {
		fmt.Println(err)
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// Get fileid from path
	fileID, err := util.GetIntPathParam(r, "fileid")
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to parse file ID", http.StatusBadRequest)
		return
	}

	// Call service
	err = c.svc.UpdateFile(fileID, user.ID, requestBody.Name, requestBody.ContextBase64, requestBody.FolderID)
	if err == ErrFileNotFound {
		fmt.Println(err)
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to update file", http.StatusInternalServerError)
		return
	}

	util.WriteJSON(w, map[string]string{
		"status": "ok",
	})
}
func (c *HTTPFileController) onDeleteFile(w http.ResponseWriter, r *http.Request, user *users.User) {
	// Get fileid from path
	fileID, err := util.GetIntPathParam(r, "fileid")
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to parse file ID", http.StatusBadRequest)
		return
	}

	// Call service
	err = c.svc.DeleteFile(user.ID, fileID)
	if err == ErrFileNotFound {
		fmt.Println(err)
		http.Error(w, "File not found", http.StatusNotFound)
		return
	}
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to delete file", http.StatusInternalServerError)
		return
	}

	// Return response
	util.WriteJSON(w, map[string]string{"status": "ok"})
}
