package filemanager

import (
	"net/http"
	"os"
	"path/filepath"
)

// GetFileName returns filename from path
func GetFileName(path string) string {
	return filepath.Base(path)
}

// GetFileInfo returns info of the file or error if occurs
func GetFileInfo(path string) (FileInfo, error) {
	fileInfo := FileInfo{Filepath: path}
	file, err := os.Open(path)
	if err != nil {
		return fileInfo, err
	}
	defer file.Close()

	fileStat, err := getFileStat(file)
	if err != nil {
		return fileInfo, err
	}

	fileInfo.Stat = fileStat

	if !fileInfo.Stat.IsDir && fileInfo.Stat.Size != 0 {
		contentType, err := getFileContentType(file)
		if err != nil {
			return fileInfo, err
		}
		fileInfo.Mime = contentType
	}

	fileInfo.Dirpath = filepath.Dir(path)
	fileInfo.Filepath = path
	fileInfo.Filename = fileStat.Name
	fileInfo.Ext = filepath.Ext(path)

	return fileInfo, err
}

func getFileStat(file *os.File) (FileStat, error) {
	fileStat := FileStat{}
	stat, err := file.Stat()
	if err != nil {
		return fileStat, err
	}

	fileStat.IsDir = stat.IsDir()
	fileStat.Mode = stat.Mode()
	fileStat.ModTime = stat.ModTime()
	fileStat.Name = stat.Name()
	fileStat.Size = stat.Size()

	return fileStat, nil
}

func getFileContentType(file *os.File) (string, error) {
	buffer := make([]byte, 512)
	_, err := file.Read(buffer)
	if err != nil {
		return "", err
	}

	contentType := http.DetectContentType(buffer)
	return contentType, nil
}
