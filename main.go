package main

import (
	"flag"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/bleenco/sharebox/filemanager"
	"github.com/bleenco/sharebox/vex"
	"github.com/julienschmidt/httprouter"
	"github.com/phyber/negroni-gzip/gzip"
	"github.com/rs/cors"
	"github.com/urfave/negroni"
)

var (
	listenAddr   = flag.String("addr", "0.0.0.0:4505", "server listen address")
	rootDir      = flag.String("dir", "./", "root serve directory")
	enableVex    = flag.Bool("vex", false, "enable vex tunnel connection")
	remoteServer = flag.String("s", "bleenco.space", "vex server hostname")
	remotePort   = flag.Int("p", 2200, "vex server SSH port")
	localServer  = flag.String("ls", "localhost", "local server hostname")
	localPort    = flag.Int("lp", 4505, "local server port")
)

func main() {
	flag.Parse()
	filemanager.Init(*rootDir)

	ch := make(chan os.Signal, 1)
	signal.Notify(ch, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT, syscall.SIGHUP)

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
	n.Use(gzip.Gzip(gzip.DefaultCompression))
	n.UseHandler(router)

	fmt.Printf("Serving files from %s at %s ...\n", *rootDir, *listenAddr)
	go http.ListenAndServe(*listenAddr, n)

	if *enableVex {
		go vexclient.InitClient(*localServer, *remoteServer, *localPort, *remotePort)
	}

	<-ch
}
