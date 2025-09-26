variable "hcloud_token" {
  type        = string
  description = "Hetzner Cloud API token"
  sensitive   = true
  default     = "tcMnL5iLnqlDWjCWvAKc374zI60QpFCBS31FacM4XStw7HjFlcveikWrWUc6YUA2"
}

variable "cluster_name" {
  type    = string
  default = "my-k8s-cluster"
}
