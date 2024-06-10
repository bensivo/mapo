# Mapo Configure

Perfom one-time setup of mapo VM instances (created with mapo-infra), using ansible

The ansible playbook in this folder does these actions:
- Install Nginx, certbox, and python3-certbot-nginx
- Configure an nginx static site, with the domain name "mapo.bensivo.com"
- Copy the static site from "mapo-webapp" to /mapo/html on the VM
- Run certbot, to get a certificate from letsencrypt, and enable a cronjob to refresh it as needed

## Usage
1. Make sure ansible is installed
    ```
    pip install ansible
    ```
2. Generate the `inventory.yml` file
    ```sh
    task inventory
    ```
3. Update your DNS provider to point "mapo.bensivo.com" to your instance IP
4. Run the ansible playbook with Taskfile
    ```
    task playbook
    ```
