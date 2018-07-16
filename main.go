package main

import (
	"flag"
	"fmt"
	"net/http"

	"github.com/bleenco/sharebox/filemanager"
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
	filemanager.Init(*rootDir)

	router := httprouter.New()
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4200"},
		AllowCredentials: true,
		AllowedHeaders:   []string{"Authorization", "Content-Type"},
	})

	router.GET("/api/files/browse/*filepath", filemanager.BrowseHandler)
	router.GET("/api/files/download/*filepath", filemanager.DownloadHandler)
	router.POST("/api/files/upload", filemanager.UploadHandler)
	router.POST("/api/files/delete", filemanager.DeleteHandler)

	router.NotFound = http.FileServer(&AssetFS{
		Asset:     Asset,
		AssetDir:  AssetDir,
		AssetInfo: AssetInfo,
		Prefix:    "./dist",
		Fallback:  "index.html",
	}).ServeHTTP

	n := negroni.New()
	n.Use(c)
	n.Use(negroni.NewRecovery())
	n.Use(negroni.NewLogger())
	n.UseHandler(router)

	fmt.Printf("Serving files from %s at %s ...\n", *rootDir, *listenAddr)
	http.ListenAndServe(*listenAddr, n)
}
