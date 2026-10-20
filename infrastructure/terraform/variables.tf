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

variable "vpc_cidr" {
  description = "VPC CIDR IP Block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "s3_bucket_name" {
  description = "S3 Bucket for code blobs & assets"
  type        = string
  default     = "veltrix-cloud-storage-2026"
}

variable "ami_id" {
  description = "Ubuntu 22.04 LTS AMI ID"
  type        = string
  default     = "ami-0c7217cdde317cfec"
}

variable "instance_type" {
  description = "EC2 Instance compute sizing"
  type        = string
  default     = "t3.medium"
}
