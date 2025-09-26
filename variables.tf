variable "hcloud_token" {
  type        = string
  description = "Hetzner Cloud API token"
  sensitive   = true
}


variable "cluster_name" {
  type    = string
  default = "my-k8s-cluster"
}
