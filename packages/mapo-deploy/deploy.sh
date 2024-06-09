#!/bin/bash

cd ../mapo-webapp
task build
cd ../mapo-deploy

# Bundle up the webapp dist into a tar
tar -czvf mapo-webapp.tar.gz -C ../mapo-webapp/dist/mapo-webapp/browser .

# Copy the tar to teh server using scp
cd ../mapo-infra
INSTANCE_IP=`tofu output -json | jq -r '.ip.value[0]'`
cd ../mapo-deploy

scp -i ../mapo-infra/outputs/mapo-webapp-dev.pem ./mapo-webapp.tar.gz root@$INSTANCE_IP:/tmp/mapo-webapp.tar.gz

# Remove old deployment
ssh -i ../mapo-infra/outputs/mapo-webapp-dev.pem root@$INSTANCE_IP "rm -rf /usr/share/nginx/html/*"

# Deploy new code
ssh -i ../mapo-infra/outputs/mapo-webapp-dev.pem root@$INSTANCE_IP "tar -xzvf /tmp/mapo-webapp.tar.gz -C /usr/share/nginx/html/"