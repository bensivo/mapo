package main

import (
	"fmt"
	"net/http"

	"github.com/bensivo/mapo/packages/mapo-api/config"
	"github.com/bensivo/mapo/packages/mapo-api/files"
	"github.com/bensivo/mapo/packages/mapo-api/health"
	"github.com/bensivo/mapo/packages/mapo-api/sqlite"
)

func main() {
	config.Initialize()

	fmt.Println("Connecting to SQLite3 database...")
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

	fmt.Printf("Listening on http://localhost:%d", config.Port)
	err = http.ListenAndServe(fmt.Sprintf(":%d", config.Port), mux)
	if err != nil {
		panic(err)
	}
}
