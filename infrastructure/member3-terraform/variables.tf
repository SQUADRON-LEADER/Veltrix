variable "aws_region" {
  description = "Target AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "data_subnets" {
  description = "Private data subnets (AZ suffix => CIDR). Must not overlap 10.0.1.0/24 or 10.0.2.0/24."
  type        = map(string)
  default = {
    a = "10.0.11.0/24"
    b = "10.0.12.0/24"
  }
}

variable "docdb_master_password" {
  description = "DocumentDB master password. Supply with TF_VAR_docdb_master_password; never commit."
  type        = string
  sensitive   = true
}

variable "redis_auth_token" {
  description = "ElastiCache Redis AUTH token (16-128 chars). Supply with TF_VAR_redis_auth_token; never commit."
  type        = string
  sensitive   = true
}

variable "cors_allowed_origins" {
  description = "Browser origins allowed to PUT/GET via pre-signed URLs"
  type        = list(string)
  default     = ["http://localhost:5173", "http://localhost:8080"]
}

variable "docdb_deletion_protection" {
  description = "Keep true. Set false only for an intentional teardown."
  type        = bool
  default     = true
}

variable "k8s_instance_type" {
  description = "Instance type for the single-node kubeadm demo cluster"
  type        = string
  default     = "t3.large"
}
