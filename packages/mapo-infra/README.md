# Mapo Infra
Manage the infrastructure used to deploy Mapo, using opentofu

## Usage

Deploy the linode instance with:
```
export LINODE_TOKEN="replaceme"
set -a; source .env; set +a

task plan
task apply
```

Then run the ansible playbook in "mapo-configure" to install nginx and configure the VM to host it as a static site
