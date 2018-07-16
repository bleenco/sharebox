package filemanager

import (
	"os"
	"time"
)

// JSONResponse holds data structure for responses
type JSONResponse struct {
	Status int         `json:"status"`
	Data   interface{} `json:"data"`
}

// JSONDeleteRequest holds data structure for delete post request
type JSONDeleteRequest struct {
	Paths []string `json:"paths"`
}

// FileStat structure holds stat data of a file
type FileStat struct {
	IsDir   bool        `json:"isdir"`
	Mode    os.FileMode `json:"mode"`
	ModTime time.Time   `json:"modtime"`
	Name    string      `json:"name"`
	Size    int64       `json:"size"`
}

// FileInfo structure holds data of file
type FileInfo struct {
	Filename string   `json:"filename"`
	Filepath string   `json:"filepath"`
	Dirpath  string   `json:"dirpath"`
	Ext      string   `json:"ext"`
	Mime     string   `json:"mime"`
	Stat     FileStat `json:"stat"`
}
