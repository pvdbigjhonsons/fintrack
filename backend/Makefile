.PHONY: dev build run tidy

dev:
	go run ./cmd/server/main.go

build:
	go build -o bin/fintrack-api ./cmd/server/main.go

tidy:
	go mod tidy

run: build
	./bin/fintrack-api
