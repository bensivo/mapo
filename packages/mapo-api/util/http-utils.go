package util

import (
	"encoding/json"
	"net/http"
)

func WriteJSON(w http.ResponseWriter, data interface{}) {
	// Serialize the data to JSON
	bytes, err := json.Marshal(data)
	if err != nil {
		http.Error(w, "Failed to serialize data to JSON", http.StatusInternalServerError)
		return
	}

	// Set the Content-Type header
	w.Header().Set("Content-Type", "application/json")

	// Write the JSON data to the response
	w.Write(bytes)
}
