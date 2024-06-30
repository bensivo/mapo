package main

import (
	"fmt"
	"net/http"

	"github.com/bensivo/mapo/packages/mapo-api/files"
	"github.com/bensivo/mapo/packages/mapo-api/health"
	"github.com/bensivo/mapo/packages/mapo-api/sqlite"
)

func main() {
	db, err := sqlite.Connect()
	if err != nil {
		panic(err)
	}

	err = sqlite.RunMigrations(db)
	if err != nil {
		panic(err)
	}

	svc := files.NewFileService(db)

	mux := &http.ServeMux{}

	fileController := files.NewHttpFileController(svc)
	fileController.Register(mux)

	healthController := health.NewHttpHealthController()
	healthController.Register(mux)

	fmt.Println("Listening on http://localhost:8080")
	err = http.ListenAndServe(":8080", mux)
	if err != nil {
		panic(err)
	}
}
