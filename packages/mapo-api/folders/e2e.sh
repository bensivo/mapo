#!/bin/bash

access_token='eyJhbGciOiJIUzI1NiIsImtpZCI6Im4rTWh0YkJ5cm42VXpCS2giLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2RhdXpoaXFzZmFtZmVpaHZmemRnLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2MWVlZjliZS1hYTk1LTQxNzAtYjFiOC1lZjZmZTJmNWI1ZjQiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzI3MzE3MTkzLCJpYXQiOjE3MjczMTM1OTMsImVtYWlsIjoidGhhbmV0YXRlMUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6Imdvb2dsZSIsInByb3ZpZGVycyI6WyJnb29nbGUiXX0sInVzZXJfbWV0YWRhdGEiOnsiYXZhdGFyX3VybCI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0w5aU1zd3hzM2QzOS1hVXota3VXeUpyQjVsQzFhYnZzanNkUjQ2b2hBajFLRVA9czk2LWMiLCJlbWFpbCI6InRoYW5ldGF0ZTFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6InRoYW5lIHRhdGUiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoidGhhbmUgdGF0ZSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0w5aU1zd3hzM2QzOS1hVXota3VXeUpyQjVsQzFhYnZzanNkUjQ2b2hBajFLRVA9czk2LWMiLCJwcm92aWRlcl9pZCI6IjExNDg4NDI0OTY4NTQyNTY5ODczNiIsInN1YiI6IjExNDg4NDI0OTY4NTQyNTY5ODczNiJ9LCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImFhbCI6ImFhbDEiLCJhbXIiOlt7Im1ldGhvZCI6Im9hdXRoIiwidGltZXN0YW1wIjoxNzI2NzA4MjgzfV0sInNlc3Npb25faWQiOiI3OGQ1ODMwMi1lMzRiLTQ4MDctYWMwMy1mYzEyMjczMzcxZGUiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.r2BfIfHSnMX037L8FSsF7p7fa3Bo_aFOdD9hWENdmWs'

echo ""
echo "POST folders"
curl \
    --request POST \
    http://localhost:3000/folders \
    --header "Authorization: Bearer $access_token" \
    --header "Content-Type: application/json" \
    --data '{
        "name": "Test",
        "parentId": 0
    }'

echo ""
echo ""
echo "GET /folders"
curl \
    --request GET \
    http://localhost:3000/folders \
    --header "Authorization: Bearer $access_token"


echo ""
echo ""
echo "GET /folders/43"
curl \
    --request GET \
    http://localhost:3000/folders/43 \
    --header "Authorization: Bearer $access_token"

echo ""
echo ""
echo "PATCH /folders/43"
curl \
    --request PATCH \
    http://localhost:3000/folders/43 \
    --header "Authorization: Bearer $access_token" \
    --header "Content-Type: application/json" \
    --data '{
        "name": "Thane"
    }'


echo ""
echo ""
echo "GET /folders/43"
curl \
    --request GET \
    http://localhost:3000/folders/43 \
    --header "Authorization: Bearer $access_token"


echo ""
echo ""
echo "DELETE /folders/43"
curl \
    --request DELETE \
    http://localhost:3000/folders/43 \
    --header "Authorization: Bearer $access_token"

echo ""
echo ""
echo "GET /folders"
curl \
    --request GET \
    http://localhost:3000/folders \
    --header "Authorization: Bearer $access_token"
