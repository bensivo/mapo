#!/bin/bash

# 
# publish.sh <tag>
# 
# Build and publish the mapo-webapp docker image to Github Container Registry (ghcr.io)
# For GitHub Actions, these should be set using the Infisical Secrets-Action

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <tag>"
    exit 1
fi

DOCKER_IMAGE_TAG=$1

# Fetch secrets from infisical [secrets-action]
if [ -z "$T_GHCR_USERNAME" ] || [ -z "$T_GHCR_TOKEN" ]; then
    echo "GHCR_USERNAME or GHCR_TOKEN environment variable not set"
    exit 1
fi

# Login to Github Container Registry (ghcr.io)
echo "Authenticating with Github Container Registry (ghcr.io)"
echo "$T_GHCR_TOKEN" | docker login ghcr.io -u "$T_GHCR_USERNAME" --password-stdin

# Build and push the docker image using buildx
echo "Building and pushing docker image"

docker build --platform=linux/amd64 -t ghcr.io/bensivo/mapo-webapp:$DOCKER_IMAGE_TAG ./packages/mapo-webapp
docker push ghcr.io/bensivo/mapo-webapp:$DOCKER_IMAGE_TAG
