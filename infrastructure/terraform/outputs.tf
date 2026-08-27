output "ecs_cluster_name" {
  value = aws_ecs_cluster.veltrix_cluster.name
}

output "s3_bucket_arn" {
  value = aws_s3_bucket.veltrix_code_storage.arn
}

output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.cdn.domain_name
}

output "alb_dns_name" {
  value = aws_lb.veltrix_alb.dns_name
}

output "docdb_endpoint" {
  value = aws_docdb_cluster.docdb.endpoint
}
