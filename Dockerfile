# stage 1 ui
FROM node:10-alpine AS ui

COPY ./ui ./app/ui

WORKDIR /app/ui

RUN npm install && npm run build

# stage 2 build
FROM golang:1.10-alpine AS build

WORKDIR /go/src/github.com/bleenco/sharebox

RUN apk --no-cache add git

COPY --from=ui /app/ui/dist /go/src/github.com/bleenco/sharebox/dist

COPY . /go/src/github.com/bleenco/sharebox/

RUN go get -u github.com/golang/dep/cmd/dep \
	  && dep ensure \
	  && go get -u github.com/jteeuwen/go-bindata/...

RUN go-bindata ./dist/... && mkdir -p build && CGO_ENABLED=0 go build -o build/sharebox *.go

# stage 3 image
FROM scratch

COPY --from=build /go/src/github.com/bleenco/sharebox/build/sharebox /usr/bin/sharebox

ENTRYPOINT [ "/usr/bin/sharebox" ]
