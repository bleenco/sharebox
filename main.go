package main

import (
	"flag"
	"fmt"
	"net/http"

	"github.com/julienschmidt/httprouter"
	"github.com/rs/cors"
	"github.com/urfave/negroni"
)

var (
	listenAddr = flag.String("port", "0.0.0.0:4505", "server listen address")
	rootDir    = flag.String("dir", "./", "root serve directory")
)

func main() {
	flag.Parse()

	router := httprouter.New()
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200"},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
	})

	router.GET("/api/files", nil)

	router.NotFound = http.FileServer(&AssetFS{
		Asset:     Asset,
		AssetDir:  AssetDir,
		AssetInfo: AssetInfo,
		Prefix:    "./dist",
		Fallback:  "index.html",
	})

	n := negroni.New()
	n.Use(c)
	n.Use(negroni.NewRecovery())
	n.UseHandler(router)

	fmt.Printf("Starting server on %s ...\n", *listenAddr)
	http.ListenAndServe(*listenAddr, n)
}
