package util

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
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

func WithLogger(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		fmt.Printf("%s HTTP %s %s\n", time.Now().Format(time.RFC3339), r.Method, r.URL.Path)
		handler(w, r)
	}
}
