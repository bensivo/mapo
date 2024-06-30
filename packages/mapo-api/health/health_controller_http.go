package health

import (
	"fmt"
	"net/http"

	"github.com/bensivo/mapo/packages/mapo-api/util"
)

// http_health_controller.go
//
// This file contains the HTTP health routes. Unlike other modules, the health module does not have a service layer.

type HTTPHealthController struct{}

func NewHttpHealthController() *HTTPHealthController {
	return &HTTPHealthController{}
}

func (c *HTTPHealthController) Register(mux *http.ServeMux) {
	fmt.Println("Registering routes from HTTPHealthController")

	fmt.Println("Registering route GET /health")
	mux.HandleFunc("GET /health", c.onGetHealth)
}

func (c *HTTPHealthController) onGetHealth(w http.ResponseWriter, r *http.Request) {
	util.WriteJSON(w, map[string]string{"status": "ok"})
}
