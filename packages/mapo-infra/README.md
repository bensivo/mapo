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

Then SSH into the instance with:
```
INSTANCE_IP=`tofu output -json | jq -r '.ip.value[0]'`
ssh -i ./outputs/mapo-webapp-dev.pem root@$INSTANCE_IP
```


## Post-Creation steps
TODO: steps for:
- Installing nginx
- Writing nginx config
- Copying html files into the right folder
- Reloading nginx