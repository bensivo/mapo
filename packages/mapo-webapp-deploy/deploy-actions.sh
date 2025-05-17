#!/bin/bash

# 
# deploy.sh <tag>
# 
# Deploy the mapo-webapp docker image to a remote VM
# 
# For GitHub Actions, these should be set using the Infisical Secrets-Action

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <env> <tag>"
    exit 1
fi

ENV=$1
DOCKER_IMAGE_TAG=$2

# Fetch secrets from infisical [secrets-action]
if [ -z "$T_GHCR_USERNAME" ] || [ -z "$T_GHCR_TOKEN" ] || [ -z "$INSTANCE_IP" ] || [ -z "$INFISICAL_CLIENT_ID" ] || [ -z "$INFISICAL_CLIENT_SECRET" ]; then
    echo "GHCR_USERNAME or GHCR_TOKEN or INSTANCE_IP or INFISICAL_CLIENT_ID or INFISICAL_CLIENT_SECRET environment variable not set"
    exit 1
fi

# Read SSH private key into a file, instead of as a string
SSH_KEY_FILEPATH="instance.pem"
echo "$INSTANCE_SSH_PRIVATE_KEY" > $SSH_KEY_FILEPATH
chmod 600 $SSH_KEY_FILEPATH

# Login to ghcr.io (on the remote maching)
ssh -i $SSH_KEY_FILEPATH -o StrictHostKeyChecking=no root@$INSTANCE_IP "
    echo $T_GHCR_TOKEN | docker login ghcr.io -u $T_GHCR_USERNAME --password-stdin
"

# Stop any existing docker image
ssh -i $SSH_KEY_FILEPATH -o StrictHostKeyChecking=no root@$INSTANCE_IP "
    set -x;
    docker rm -f mapo-webapp || true;
"

# Run the new docker image
ssh -i $SSH_KEY_FILEPATH -o StrictHostKeyChecking=no root@$INSTANCE_IP "
    set -x;
    docker run -d \
        --restart always \
        --name mapo-webapp \
        -p 8080:80 \
        -e APP_VERSION=$DOCKER_IMAGE_TAG \
        -e INFISICAL_CLIENT_ID=$INFISICAL_CLIENT_ID \
        -e INFISICAL_CLIENT_SECRET=$INFISICAL_CLIENT_SECRET \
        -e INFISICAL_ENV=$ENV \
        -e INFISICAL_PROJECT_ID=3e288ed5-a408-4b19-adbd-50b911a27653 \
        ghcr.io/bensivo/mapo-webapp:$DOCKER_IMAGE_TAG;
"
