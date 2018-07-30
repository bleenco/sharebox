all: checkdir build

build:
	@go build -o build/sharebox *.go

prod:
	@mkdir -p build
	@rm -rf dist ./ui/dist
	@cd ui && npm run build
	@cp -rf ./ui/dist ./dist
	@go-bindata ./dist/...
	@go build -o build/sharebox *.go

dist:
	@mkdir -p build
	@rm -rf dist ./ui/dist
	@cd ui && npm run build
	@cp -rf ./ui/dist ./dist
	@go-bindata ./dist/...
	@gox -osarch="darwin/amd64 linux/386 linux/arm linux/amd64 windows/amd64" -output="build/{{.Dir}}-{{.OS}}-{{.Arch}}"

run:
	@go run *.go

checkdir:
	@mkdir -p build

install:
	go get -u github.com/golang/dep/cmd/dep
	dep ensure
	go get -u github.com/jteeuwen/go-bindata/...
	go get -u github.com/mitchellh/gox
	go get -u github.com/cespare/reflex
	cd ui && npm install

.PHONY: checkdir build dist install
