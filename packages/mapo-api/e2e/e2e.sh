#!/bin/bash
# 
# A quick manual test script for the file endpoints of this API.
# This test suite assumes you're operating on a new DB, and requires that the user manually check the output
# 

# TODO: save the ids from the insert commands, and use them in the get, update and delete commands
# instead of just hardcodign the id '1' in each request
echo "Inserting files"
curl -s -X POST http://localhost:8080/files --data '
    {
        "userId": 1,
        "name": "test-file-1",
        "contentBase64": "content-test-file-1"
    }
' | jq -r
curl -s -X POST http://localhost:8080/files --data '
    {
        "userId": 2,
        "name": "test-file-2",
        "contentBase64": "content-test-file-2"
    }
' | jq -r


echo "Getting files"
curl -s -X GET http://localhost:8080/files | jq -r

echo "Getting file 1"
curl -s -X GET http://localhost:8080/files/1  | jq -r


echo "Updating file 1 name"
curl -s -X PATCH http://localhost:8080/files/1 --data '
    {
        "name": "test-file-1-updated"
    }   
' | jq -r

echo "Getting file 1"
curl -s -X GET http://localhost:8080/files/1  | jq -r


echo "Deleting file 1"
curl -s -X DELETE http://localhost:8080/files/1 | jq -r

echo "Getting files"
curl -s -X GET http://localhost:8080/files | jq -r