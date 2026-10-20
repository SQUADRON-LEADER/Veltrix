output "vpc_id" {
  description = "Created VPC Identifier"
  value       = aws_vpc.veltrix_vpc.id
}

output "alb_dns_name" {
  description = "Application Load Balancer Public DNS Entrypoint"
  value       = aws_lb.veltrix_alb.dns_name
}

output "s3_bucket_arn" {
  description = "Veltrix S3 Storage ARN"
  value       = aws_s3_bucket.veltrix_code_storage.arn
}

output "jenkins_instance_id" {
  description = "Jenkins Controller EC2 Instance ID"
  value       = aws_instance.jenkins_controller.id
}

output "k8s_master_instance_id" {
  description = "Kubernetes Master EC2 Instance ID"
  value       = aws_instance.k8s_master.id
}
