terraform {
  required_providers {
    linode = {
      source  = "linode/linode"
    }
  }
}

provider "linode" {
    # Be sure to export the env variable LINODE_TOKEN
    # 
    # To export env varibales from a .env file, use the following command:
    #   set -a; source .env; set +a
    # 
}


locals {
  name = "mapo-webapp-dev"
}

# Create an SSH key
resource "tls_private_key" "ssh" {
  algorithm = "RSA"
  rsa_bits  = 4096
}


# Register the SSH key with Linode
resource "linode_sshkey" "this" {
  label = local.name 
  ssh_key = trimspace(tls_private_key.ssh.public_key_openssh)
}

# Random root password for the instance
resource "random_password" "password" {
  length           = 32
  special          = true
}


# Create a Linode Instance
resource "linode_instance" "this" {
  label           = local.name
  image           = "linode/debian12" # https://api.linode.com/v4/images
  region          = "us-central"  # Dallas, TX
  type            = "g6-nanode-1"  # https://api.linode.com/v4/linode/types
  authorized_keys = [linode_sshkey.this.ssh_key]
  root_pass       = random_password.password.result

  # TODO: add a firewall, so only HTTPS, SSH are allowed
  # firewall_id = ""
}


# Store secrets as files on the local system
resource "local_file" "ssh_private_key" {
  content = tls_private_key.ssh.private_key_openssh
  filename = "outputs/${local.name}.pem"
}

# Becuase this is an SSH key, we need to run chmod 600 on it, we use a null_resource with local-exec provisioner to do this
resource "null_resource" "chmod_ssh_private_key" {
  depends_on = [ local_file.ssh_private_key ]
  provisioner "local-exec" {
    command = "chmod 600 outputs/${local.name}.pem"
  }
}
resource "local_file" "ssh_public_key" {
  content = tls_private_key.ssh.public_key_openssh
  filename = "outputs/${local.name}.pub"
}

resource "local_file" "root_password" {
  content = random_password.password.result
  filename = "outputs/${local.name}.password"
}

resource "local_file" "ip" {
  content = linode_instance.this.ip_address
  filename = "outputs/${local.name}.ip"
}

output "ip" {
  value = linode_instance.this.ip_address
}