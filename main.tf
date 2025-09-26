resource "hcloud_ssh_key" "default" {
  name       = "github-actions-key"
  public_key = file("~/.ssh/id_rsa.pub")
}

resource "hcloud_server" "k8s_master" {
  name        = "${var.cluster_name}-master"
  image       = "ubuntu-22.04"
  server_type = "cpx11"
  location    = "nbg1"
  ssh_keys    = [hcloud_ssh_key.default.id]
}

resource "hcloud_server" "k8s_worker" {
  count       = 2
  name        = "${var.cluster_name}-worker-${count.index}"
  image       = "ubuntu-22.04"
  server_type = "cpx11"
  location    = "nbg1"
  ssh_keys    = [hcloud_ssh_key.default.id]
}

output "master_ip" {
  value = hcloud_server.k8s_master.ipv4_address
}
