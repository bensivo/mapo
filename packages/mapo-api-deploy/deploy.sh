#!/bin/bash

# 
# deploy.sh <tag>
# 
# Deploy the mapo-api docker image to a remote VM
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

# postgresql://postgres.dauzhiqsfamfeihvfzdg:WMYWa4Nbj%2AkAUf%25%25Wa%26C@aws-0-us-west-1.pooler.supabase.com:6543/postgres
# postgresql://postgres:WMYWa4Nbj%2AkAUf%25%25Wa%26C@db.dauzhiqsfamfeihvfzdg.supabase.co:5432/postgres

# Fetch secrets from infisical
echo "Fetching secrets from infisical"
GHCR_USERNAME=`infisical secrets get GHCR_USERNAME --plain --silent --env=$ENV`
GHCR_TOKEN=`infisical secrets get GHCR_TOKEN --plain --silent --env=$ENV`
INSTANCE_IP=`infisical secrets get INSTANCE_IP --plain --silent --env=$ENV`
JWT_AUDIENCE=`infisical secrets get JWT_AUDIENCE --plain --silent --env=$ENV`
JWT_ISSUER=`infisical secrets get JWT_ISSUER --plain --silent --env=$ENV`
JWT_SECRET=`infisical secrets get JWT_SECRET --plain --silent --env=$ENV`
POSTGRES_CONNECTION_STRING=`infisical secrets get POSTGRES_CONNECTION_STRING --plain --silent --env=$ENV`

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
    docker rm -f mapo-api || true;
"

# Run the new docker image
ssh -i $SSH_KEY_FILEPATH root@$INSTANCE_IP "
    set -x;
    docker run -d \
        --restart always \
        --name mapo-api \
        -p 3000:3000 \
        -v /mapo:/mapo \
        -e JWT_AUDIENCE=$JWT_AUDIENCE \
        -e JWT_ISSUER=$JWT_ISSUER \
        -e JWT_SECRET=$JWT_SECRET \
        -e POSTGRES_CONNECTION_STRING=$POSTGRES_CONNECTION_STRING \
        ghcr.io/bensivo/mapo-api:$DOCKER_IMAGE_TAG;
"

