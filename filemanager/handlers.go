package filemanager

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"time"

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

	downloadBytes, _ := ioutil.ReadFile(path)
	mime := http.DetectContentType(downloadBytes)
	fileSize := len(string(downloadBytes))

	w.Header().Set("Content-Type", mime)
	w.Header().Set("Content-Disposition", "attachment; filename="+filepath.Base(path)+"")
	w.Header().Set("Expires", "0")
	w.Header().Set("Content-Transfer-Encoding", "binary")
	w.Header().Set("Content-Length", strconv.Itoa(fileSize))
	w.Header().Set("Content-Control", "private, no-transform, no-store, must-revalidate")

	http.ServeContent(w, r, path, time.Now(), bytes.NewReader(downloadBytes))
}

// DownloadZipHandler creates temporary .zip archive file and sends its contents to response writer
func DownloadZipHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	pquery, err := url.ParseQuery(r.URL.RawQuery)
	if err != nil {
		fmt.Println(err)
	}
	filePaths := make([]string, len(pquery["filePath"]))
	for i, filePath := range pquery["filePath"] {
		filePaths[i] = path.Clean(root + "/" + filePath)
	}

	zipFile, err := ioutil.TempFile("", "archive-sharebox-")
	if err != nil {
		fmt.Println(err)
	}
	defer os.Remove(zipFile.Name())

	if err := zipIt(filePaths, zipFile); err != nil {
		fmt.Println(err)
	}

	downloadBytes, _ := ioutil.ReadFile(zipFile.Name())
	mime := http.DetectContentType(downloadBytes)
	fileSize := len(string(downloadBytes))

	w.Header().Set("Content-Type", mime)
	w.Header().Set("Content-Disposition", "attachment; filename="+filepath.Base(zipFile.Name())+".zip")
	w.Header().Set("Expires", "0")
	w.Header().Set("Content-Transfer-Encoding", "binary")
	w.Header().Set("Content-Length", strconv.Itoa(fileSize))
	w.Header().Set("Content-Control", "private, no-transform, no-store, must-revalidate")

	http.ServeContent(w, r, zipFile.Name(), time.Now(), bytes.NewReader(downloadBytes))
}

// CreateFolderHandler creates folder and returns status response
func CreateFolderHandler(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	type createFolderType struct {
		FilePath string `json:"filePath"`
	}
	var form createFolderType
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(&form); err != nil {
		fmt.Println(err)
	}

	folderName := form.FilePath
	folderPath := path.Clean(root + "/" + folderName)

	if fileExists(folderPath) {
		for ok := true; ok; ok = fileExists(folderPath) {
			extension := filepath.Ext(folderName)
			foldernameWithoutExt := folderName[0 : len(folderName)-len(extension)]
			folderName = foldernameWithoutExt + "-" + buildFileName() + extension
			folderPath = path.Clean(root + "/" + folderName)
		}
	}

	var data JSONResponse
	if err := os.MkdirAll(folderPath, 0755); err != nil {
		data.Status = http.StatusInternalServerError
		data.Data = err.Error()
	} else {
		data.Status = http.StatusOK
		data.Data = "Folder succesfully created"
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(data)
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

	for _, itemPath := range reqData.Paths {
		fullPath := path.Clean(root + "/" + itemPath)
		err = os.RemoveAll(fullPath)
		if err != nil {
			panic(err)
		}
	}

	data := JSONResponse{Status: http.StatusOK, Data: "ok"}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}
