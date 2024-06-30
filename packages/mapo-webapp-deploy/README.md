# Mapo Configure
Deploy mapo to a VM using ansible. Run after deploying the VM with 'mapo-infra'

The ansible playbook in this folder does these actions:
- Install Nginx, certbox, and python3-certbot-nginx
- Configure an nginx static site, with the domain name "mapo.bensivo.com"
- Copy the static site from "mapo-webapp" to /mapo/html on the VM
- Run certbot, to get a certificate from letsencrypt, and enable a cronjob to refresh it as needed

## Usage
1. Deploy the VM with 'mapo-infra' and build the webapp with 'mapo-webapp'
    ```
    pip install ansible
    ```
2. Make sure ansible is installed
    ```
    pip install ansible
    ```
3. Generate the `inventory.yml` file
    ```sh
    task inventory
    ```
4. Update your DNS provider to point "mapo.bensivo.com" to your instance IP
5. Run the ansible playbook with Taskfile
    ```
    task playbook
    ```
