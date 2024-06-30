package files

// http_file_controller.go
//
// This file contains the HTTP routes which map to the FileService, including basic REST API CRUD operations.
// Anything specific to HTTP is performed here (parsing request bodies, HTTP request paths, writing responses in JSON format, etc.)

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"

	"github.com/bensivo/mapo/packages/mapo-api/util"
)

type HTTPFileController struct {
	svc *FileService
}

func NewHttpFileController(svc *FileService) *HTTPFileController {
	return &HTTPFileController{
		svc,
	}
}

func (c *HTTPFileController) Register(mux *http.ServeMux) {
	fmt.Println("Registering routes from HTTPFileController")

	fmt.Println("Registering route POST /files")
	mux.HandleFunc("POST /files", c.onPostFile)

	fmt.Println("Registering route GET /files")
	mux.HandleFunc("GET /files", c.onGetFiles)

	fmt.Println("Registering route GET /files/{fileid}")
	mux.HandleFunc("GET /files/{fileid}", c.onGetFile)

	fmt.Println("Registering route PATCH /files/{fileid}")
	mux.HandleFunc("PATCH /files/{fileid}", c.onUpdateFile)

	fmt.Println("Registering route DELETE /files/{fileid}")
	mux.HandleFunc("DELETE /files/{fileid}", c.onDeleteFile)
}

func (c *HTTPFileController) onPostFile(w http.ResponseWriter, r *http.Request) {
	// Parse the request body
	var data struct {
		UserID        int    `json:"userId"`
		Name          string `json:"name"`
		ContextBase64 string `json:"contentBase64"`
	}
	bytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(bytes, &data)
	if err != nil {
		http.Error(w, "Failed to parse JSON request body", http.StatusBadRequest)
		return
	}

	// Call service
	file, err := c.svc.InsertFile(data.UserID, data.Name, data.ContextBase64)
	if err != nil {
		http.Error(w, "Failed to insert file", http.StatusInternalServerError)
		return
	}

	// Return response
	// TODO, define a struct for the JSON response
	util.WriteJSON(w, file)
}

func (c *HTTPFileController) onGetFiles(w http.ResponseWriter, r *http.Request) {
	files, err := c.svc.GetFiles()
	if err != nil {
		http.Error(w, "Failed to get files", http.StatusInternalServerError)
		return
	}

	// TODO, define a struct for the JSON response
	util.WriteJSON(w, files)
}

func (c *HTTPFileController) onGetFile(w http.ResponseWriter, r *http.Request) {

	fileIDStr := r.PathValue("fileid")
	fileID, err := strconv.Atoi(fileIDStr)
	if err != nil {
		http.Error(w, "Failed to parse file ID", http.StatusBadRequest)
		return
	}

	file, err := c.svc.GetFile(fileID)
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusInternalServerError)
		return
	}

	util.WriteJSON(w, file)

}
func (c *HTTPFileController) onUpdateFile(w http.ResponseWriter, r *http.Request) {
	// Parse the request body
	var data struct {
		UserID        int    `json:"user_id"`
		Name          string `json:"name"`
		ContextBase64 string `json:"content_base64"`
	}
	bytes, err := io.ReadAll(r.Body)
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	err = json.Unmarshal(bytes, &data)
	if err != nil {
		http.Error(w, "Failed to parse JSON request body", http.StatusBadRequest)
		return
	}

	// Get fileid from path
	idStr := r.PathValue("fileid")
	fileID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Failed to parse file ID", http.StatusBadRequest)
		return
	}

	// Call service
	err = c.svc.UpdateFile(fileID, data.UserID, data.Name, data.ContextBase64)
	if err != nil {
		http.Error(w, "Failed to update file", http.StatusInternalServerError)
		return
	}

	util.WriteJSON(w, map[string]string{
		"status": "ok",
	})
}
func (c *HTTPFileController) onDeleteFile(w http.ResponseWriter, r *http.Request) {
	// Get fileid from path
	idStr := r.PathValue("fileid")
	fileID, err := strconv.Atoi(idStr)
	if err != nil {
		http.Error(w, "Failed to parse file ID", http.StatusBadRequest)
		return
	}

	// Call service
	err = c.svc.DeleteFile(fileID)
	if err != nil {
		http.Error(w, "Failed to delete file", http.StatusInternalServerError)
		return
	}

	// Return response
	util.WriteJSON(w, map[string]string{"status": "ok"})
}
