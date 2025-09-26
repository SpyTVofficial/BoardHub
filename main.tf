# Generate an SSH key with Terraform
resource "tls_private_key" "default" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# Create the SSH key in Hetzner
resource "hcloud_ssh_key" "default" {
  name       = "terraform-generated-key"
  public_key = tls_private_key.default.public_key_openssh
}

# Hetzner master node
resource "hcloud_server" "k8s_master" {
  name        = "${var.cluster_name}-master"
  image       = "ubuntu-22.04"
  server_type = "cpx11"
  location    = "nbg1"
  ssh_keys    = [hcloud_ssh_key.default.id]
}

# Hetzner worker nodes
resource "hcloud_server" "k8s_worker" {
  count       = 2
  name        = "${var.cluster_name}-worker-${count.index}"
  image       = "ubuntu-22.04"
  server_type = "cpx11"
  location    = "nbg1"
  ssh_keys    = [hcloud_ssh_key.default.id]
}

# Outputs
output "master_ip" {
  value = hcloud_server.k8s_master.ipv4_address
}

output "private_key_pem" {
  value     = tls_private_key.default.private_key_pem
  sensitive = true
}
