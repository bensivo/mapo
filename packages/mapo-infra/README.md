# Mapo Infra
Manage the infrastructure used to deploy Mapo, using opentofu

## Usage


1. Authenticate with infisical
    ```sh
    insifical login
    ```

2. Deploy the linode instance
    ```
    export LINODE_TOKEN=`infisical secrets get LINODE_TOKEN --plain --silent`

    # NOTE: the 'env' variable maps to a tofu workspace, and a $env.tfvars file
    task plan env=dev  

    task apply
    ```

Then run the ansible playbook in "mapo-configure" to install nginx and configure the VM to host it as a static site
