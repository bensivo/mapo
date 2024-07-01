#!/bin/bash

# 
# deploy.sh <tag>
# 
# Deploy the mapo-webapp docker image to a remote VM
# 
# Prerequisites: 
# - GHCR_USERNAME and GHCR_TOKEN environment variables are set
# - The tagged image is already published to ghcr.io (using publish.sh)
# - The VM is up and running (using mapo-infra and mapo-infa-configure)
# 

if [ "$#" -ne 2 ]; then
    echo "Usage: $0 <env> <tag>"
    exit 1
fi

ENV=$1
DOCKER_IMAGE_TAG=$2


# Fetch secrets from infisical
echo "Fetching secrets from infisical"
GHCR_USERNAME=`infisical secrets get GHCR_USERNAME --plain --silent --env=$ENV`
GHCR_TOKEN=`infisical secrets get GHCR_TOKEN --plain --silent --env=$ENV`
INSTANCE_IP=`infisical secrets get INSTANCE_IP --plain --silent --env=$ENV`

# Read SSH private key into a file, instead of as a string
SSH_KEY_FILEPATH="instance.pem" 
infisical secrets get INSTANCE_SSH_PRIVATE_KEY --plain --silent --env=$ENV > $SSH_KEY_FILEPATH
chmod 600 $SSH_KEY_FILEPATH

# Login to ghcr.io (on the remote maching)
ssh -i $SSH_KEY_FILEPATH root@$INSTANCE_IP "
    echo $GHCR_TOKEN | docker login ghcr.io -u $GHCR_USERNAME --password-stdin
"

# Stop any existing docker image
ssh -i $SSH_KEY_FILEPATH root@$INSTANCE_IP "
    set -x;
    docker rm -f mapo-webapp || true;
"

# Run the new docker image
ssh -i $SSH_KEY_FILEPATH root@$INSTANCE_IP "
    set -x;
    docker run -d \
        --restart always \
        --name mapo-webapp \
        -p 8080:80 \
        ghcr.io/bensivo/mapo-webapp:$DOCKER_IMAGE_TAG;
"
