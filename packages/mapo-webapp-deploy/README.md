# mapo-webapp-deploy

This package contains scripts for publishing mapo-webapp's Docker image to Github, and for deploying that image to the VM

It uses Ansible to install and setup Nginx and LetsEncrypt

## Usage
1. Use mapo-infra to deploy a new linode VM

2. Use mapo-infra-configure to setup that VM (install docker, etc)

3. Login to infisical secret manager
    ```
    infisical login
    ```
4. Build and publish docker container to github
    ```sh
    ./publish.sh 0.0.1
    ```

5. Deploy to the VM
    ```sh
    ./deploy.sh dev 0.0.1
    ```