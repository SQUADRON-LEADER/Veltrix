variable "aws_region" {
  description = "Target AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment identifier (dev, staging, prod)"
  type        = string
  default     = "production"
}

variable "s3_bucket_name" {
  description = "S3 Bucket for code blobs & assets"
  type        = string
  default     = "veltrix-cloud-storage-2026"
}

variable "docdb_username" {
  description = "DocumentDB Master Username"
  type        = string
  default     = "veltrix_admin"
}

variable "docdb_password" {
  description = "DocumentDB Master Password"
  type        = string
  sensitive   = true
  default     = "VeltrixSecurePass2026!"
}

variable "vpc_id" {
  description = "AWS VPC Identifier"
  type        = string
  default     = "vpc-0123456789abcdef0"
}

variable "subnet_ids" {
  description = "Subnet IDs for ALB"
  type        = list(string)
  default     = ["subnet-0123456789abcdef0", "subnet-0123456789abcdef1"]
}
