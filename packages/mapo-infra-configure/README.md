# mapo-infra-configure

This package contains VM configuration code, run once for each VM that is running mapo services

It uses Ansible to install and install Docker, Nginx, and LetsEncrypt certbot


## Usage
1. Use mapo-infra to deploy a new linode VM

2. Make sure ansible is installed
    ```
    pip install ansible
    ```
3. Generate the `inventory.yml` file
    ```sh
    task inventory instance_name=mapo-dev
    ```

4. Run the playbook
    ```sh
    ansible-playbook -i inventory.yml playbooks/<book>.yml
    ```