FROM golang:1.22-bookworm AS build

WORKDIR /build/

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN go build -o /build/mapo-api main.go 

FROM debian:bookworm-slim

WORKDIR /mapo-api
COPY --from=build /build/mapo-api /mapo-api/mapo-api

EXPOSE 3000
CMD [ "/mapo-api/mapo-api" ]