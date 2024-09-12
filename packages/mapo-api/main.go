package main

import (
	"fmt"
	"net/http"

	"github.com/rs/cors"

	"github.com/bensivo/mapo/packages/mapo-api/config"
	"github.com/bensivo/mapo/packages/mapo-api/db"
	"github.com/bensivo/mapo/packages/mapo-api/files"
	"github.com/bensivo/mapo/packages/mapo-api/folders"
	"github.com/bensivo/mapo/packages/mapo-api/health"
	"github.com/bensivo/mapo/packages/mapo-api/jwt"
	"github.com/bensivo/mapo/packages/mapo-api/users"
)

func main() {
	err := config.Initialize()
	if err != nil {
		panic(err)
	}

	fmt.Println("Connecting to database...")
	conn, err := db.ConnectPostgres()
	if err != nil {
		panic(err)
	}

	err = db.RunMigrations(conn)
	if err != nil {
		panic(err)
	}

	userSvc := users.NewUserService(conn)
	fileSvc := files.NewFileService(conn)
	jwtSvc := jwt.NewJwtService(userSvc)
	folderSvc := folders.NewFolderService()

	httpFileController := files.NewHttpFileController(fileSvc, jwtSvc)
	httpHealthController := health.NewHttpHealthController()
	httpFolderController := folders.NewHttpFolderController(folderSvc)

	mux := &http.ServeMux{}
	httpFileController.Register(mux)
	httpHealthController.Register(mux)
	httpFolderController.Register(mux)

	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PATCH", "DELETE"},
		AllowedHeaders:   []string{"authorization", "content-type"},
		Debug:            true,
	})
	handler := c.Handler(mux)

	fmt.Printf("Listening on http://localhost:%d\n", config.Port)
	err = http.ListenAndServe(fmt.Sprintf(":%d", config.Port), handler)
	if err != nil {
		panic(err)
	}
}
