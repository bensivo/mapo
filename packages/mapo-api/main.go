package main

import (
	"fmt"
	"net/http"

	"github.com/bensivo/mapo/packages/mapo-api/config"
	"github.com/bensivo/mapo/packages/mapo-api/db"
	"github.com/bensivo/mapo/packages/mapo-api/files"
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

	httpFileController := files.NewHttpFileController(fileSvc, jwtSvc)
	httpHealthController := health.NewHttpHealthController()

	mux := &http.ServeMux{}
	httpFileController.Register(mux)
	httpHealthController.Register(mux)

	fmt.Printf("Listening on http://localhost:%d\n", config.Port)
	err = http.ListenAndServe(fmt.Sprintf(":%d", config.Port), mux)
	if err != nil {
		panic(err)
	}
}
