package main

import (
	"fmt"
	"net/http"

	"github.com/bensivo/mapo/packages/mapo-api/controller"
	"github.com/bensivo/mapo/packages/mapo-api/service"
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

	svc := service.NewFileService(db)

	mux := &http.ServeMux{}
	fileController := controller.NewHttpFileController(svc)
	fileController.Register(mux)

	fmt.Println("Listening on http://localhost:8080")
	err = http.ListenAndServe(":8080", mux)
	if err != nil {
		panic(err)
	}
}
