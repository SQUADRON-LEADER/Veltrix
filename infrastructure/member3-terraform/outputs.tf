output "data_subnet_ids" {
  description = "Private data subnets"
  value       = [for s in aws_subnet.data : s.id]
}

output "docdb_endpoint" {
  description = "DocumentDB cluster endpoint (private)"
  value       = aws_docdb_cluster.this.endpoint
}

output "redis_primary_endpoint" {
  description = "ElastiCache Redis primary endpoint (private, TLS)"
  value       = aws_elasticache_replication_group.this.primary_endpoint_address
}

output "s3_bucket" {
  description = "Private artifacts bucket"
  value       = aws_s3_bucket.artifacts.bucket
}

output "node_role_arn" {
  value = aws_iam_role.node.arn
}

output "node_instance_profile" {
  value = aws_iam_instance_profile.node.name
}

output "k8s_instance_id" {
  description = "Single-node kubeadm cluster host (Session Manager access only)"
  value       = aws_instance.k8s.id
}
