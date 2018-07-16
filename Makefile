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

run:
	@go run *.go

checkdir:
	@mkdir -p build

install:
	go get -u github.com/golang/dep/cmd/dep
	dep ensure
	go get -u github.com/jteeuwen/go-bindata/...
	cd ui && npm install

.PHONY: checkdir build
