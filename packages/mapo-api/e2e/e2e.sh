#!/bin/bash
# 
# A quick manual test script for the file endpoints of this API.
# This test suite assumes you're operating on a new DB, and requires that the user manually check the output
# 

# TODO: save the ids from the insert commands, and use them in the get, update and delete commands
# instead of just hardcodign the id '1' in each request

# base_url="http://localhost:3000"
base_url="https://mapo.bensivo.com/api"

echo "Healthcheck"
curl -s -X GET $base_url/health | jq -r

echo "Inserting files"
curl -s -X POST $base_url/files --data '
    {
        "userId": 1,
        "name": "test-file-1",
        "contentBase64": "content-test-file-1"
    }
' | jq -r
curl -s -X POST $base_url/files --data '
    {
        "userId": 2,
        "name": "test-file-2",
        "contentBase64": "content-test-file-2"
    }
' | jq -r


echo "Getting files"
curl -s -X GET $base_url/files | jq -r

echo "Getting file 1"
curl -s -X GET $base_url/files/1  | jq -r


echo "Updating file 1 name"
curl -s -X PATCH $base_url/files/1 --data '
    {
        "name": "test-file-1-updated"
    }   
' | jq -r

echo "Getting file 1"
curl -s -X GET $base_url/files/1  | jq -r


echo "Deleting file 1"
curl -s -X DELETE $base_url/files/1 | jq -r

echo "Getting files"
curl -s -X GET $base_url/files | jq -r