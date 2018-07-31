package filemanager

import (
	"encoding/json"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/julienschmidt/httprouter"
)

// BrowseHandler finds a glob of files in directory and returns as JSON output
func BrowseHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	path := root + "/" + ps.ByName("filepath")
	pattern := path + "/*"
	files, _ := filepath.Glob(pattern)

	var resp []FileInfo
	for _, f := range files {
		fileInfo, _ := GetFileInfo(f)
		fileInfo.Filepath = strings.TrimPrefix(fileInfo.Filepath, root)
		fileInfo.Dirpath = strings.TrimPrefix(fileInfo.Dirpath, root)
		resp = append(resp, fileInfo)
	}

	data := JSONResponse{Status: 200, Data: resp}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}

// DownloadHandler reads a file and send it contents to response writer
func DownloadHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	path := root + "/" + ps.ByName("filepath")

	file, _ := ioutil.ReadFile(path)
	w.Write(file)
}

// UploadHandler reads a file from HTTP request and save it to disk
func UploadHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	const _24K = (1 << 10) * 24
	if err := r.ParseMultipartForm(_24K); nil != err {
		w.WriteHeader(http.StatusInternalServerError)
	}

	path := root + "/" + r.FormValue("dirpath")

	infile, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Error parsing upload file: "+err.Error(), http.StatusBadRequest)
		return
	}

	fileName := header.Filename
	filePath := path + "/" + fileName

	if fileExists(filePath) {
		for ok := true; ok; ok = fileExists(filePath) {
			extension := filepath.Ext(header.Filename)
			filenameWithoutExt := fileName[0 : len(fileName)-len(extension)]
			fileName = filenameWithoutExt + "-" + buildFileName() + extension
			filePath = path + "/" + fileName
		}
	}

	outfile, err := os.Create(filePath)
	if err != nil {
		http.Error(w, "Error saving file: "+err.Error(), http.StatusBadRequest)
		return
	}

	defer outfile.Close()

	_, err = io.Copy(outfile, infile)
	if err != nil {
		http.Error(w, "Error saving file: "+err.Error(), http.StatusBadRequest)
		return
	}

	data := JSONResponse{Status: http.StatusOK, Data: "ok"}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
}

// DeleteHandler accepts array of paths and delete them on disk
func DeleteHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	decoder := json.NewDecoder(r.Body)
	var reqData JSONDeleteRequest
	err := decoder.Decode(&reqData)
	if err != nil {
		panic(err)
	}
	defer r.Body.Close()

	for _, path := range reqData.Paths {
		fullPath := root + "/" + path
		err = os.RemoveAll(fullPath)
		if err != nil {
			panic(err)
		}
	}

	data := JSONResponse{Status: http.StatusOK, Data: "ok"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
