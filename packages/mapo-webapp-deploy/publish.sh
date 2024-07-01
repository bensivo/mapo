#!/bin/bash

# 
# publish.sh <tag>
# 
# Build and publish the mapo-webapp docker image to Github Container Registry (ghcr.io)
# 
# Prerequisites:
# - You are logged in to infisical CLI `infisical login`
# 

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <tag>"
    exit 1
fi

DOCKER_IMAGE_TAG=$1

# Fetch secrets from infisical
echo "Fetching secrets from infisical"
GHCR_USERNAME=`infisical secrets get GHCR_USERNAME --plain --silent`
GHCR_TOKEN=`infisical secrets get GHCR_TOKEN --plain --silent`

# Login to Github Container Registry (ghcr.io)
echo "Authenticating with Github Container Registry (ghcr.io)"
echo $GHCR_TOKEN | docker login ghcr.io -u $GHCR_USERNAME --password-stdin

# Build and push the docker image using buildx
echo "Building and pushing docker image"
docker buildx build --platform=linux/amd64,linux/arm64 -t ghcr.io/bensivo/mapo-webapp:$DOCKER_IMAGE_TAG --push  ../mapo-webapp
