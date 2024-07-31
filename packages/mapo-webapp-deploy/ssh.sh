#!/bin/bash 

if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <env>"
    exit 1
fi

ENV=$1

echo "Fetching secrets from infisical"
INSTANCE_IP=`infisical secrets get INSTANCE_IP --plain --silent --env=$ENV`
SSH_KEY_FILEPATH="instance.pem" 
infisical secrets get INSTANCE_SSH_PRIVATE_KEY --plain --silent --env=$ENV > $SSH_KEY_FILEPATH
chmod 600 $SSH_KEY_FILEPATH

# Login to ghcr.io (on the remote maching)
ssh -i $SSH_KEY_FILEPATH root@$INSTANCE_IP