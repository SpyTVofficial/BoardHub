# -------------------------
# Random suffix for SSH key
# -------------------------
resource "random_id" "suffix" {
  byte_length = 3
}

# -------------------------
# Generate SSH key
# -------------------------
resource "tls_private_key" "default" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

# -------------------------
# Add SSH key to Hetzner
# -------------------------
resource "hcloud_ssh_key" "default" {
  name       = "terraform-key-${random_id.suffix.hex}"
  public_key = tls_private_key.default.public_key_openssh
}

# -------------------------
# Master node
# -------------------------
resource "hcloud_server" "k8s_master" {
  name        = "${var.cluster_name}-master"
  image       = "ubuntu-22.04"
  server_type = "cpx11"
  location    = "nbg1"
  ssh_keys    = [hcloud_ssh_key.default.id]
}

# -------------------------
# Worker nodes
# -------------------------
resource "hcloud_server" "k8s_worker" {
  name        = "${var.cluster_name}-worker"
  image       = "ubuntu-22.04"
  server_type = "cpx11"
  location    = "nbg1"
  ssh_keys    = [hcloud_ssh_key.default.id]
}

# -------------------------
# Write private key to file
# -------------------------
resource "local_file" "private_key_file" {
  filename        = "${path.module}/private_key.pem"
  content         = tls_private_key.default.private_key_pem
  file_permission = "0600"
}

# -------------------------
# Generate Ansible inventory
# -------------------------
resource "local_file" "ansible_inventory" {
  filename = "${path.module}/inventory.ini"
  content  = <<EOT
[managers]
manager1 ansible_host=${hcloud_server.k8s_master.ipv4_address} ansible_user=root ansible_ssh_private_key_file=./private_key.pem

[workers]
${join("\n", [
  for i, w in hcloud_server.k8s_worker :
  "worker${i+1} ansible_host=${w.ipv4_address} ansible_user=root ansible_ssh_private_key_file=./private_key.pem"
])}

[all:vars]
ansible_python_interpreter=/usr/bin/python3
ansible_ssh_common_args='-o StrictHostKeyChecking=no'
EOT
}

# -------------------------
# Run Ansible playbooks automatically
# -------------------------
resource "null_resource" "run_ansible" {
  depends_on = [
    hcloud_server.k8s_master,
    hcloud_server.k8s_worker,
    local_file.ansible_inventory,
    local_file.private_key_file
  ]

  provisioner "local-exec" {
    command = <<EOT
      ansible-playbook -i ${local_file.ansible_inventory.filename} playbooks/k3s.yml
      ansible-playbook -i ${local_file.ansible_inventory.filename} playbooks/deploy_board_hub.yml
    EOT
  }
}

# -------------------------
# Outputs
# -------------------------

output "master_ip" {
  value = hcloud_server.k8s_master.network[0].ip
}

output "worker_ips" {
  value = [for w in hcloud_server.k8s_worker : w.network[0].ip]
}

output "private_key_file" {
  value = local_file.private_key_file.filename
}

