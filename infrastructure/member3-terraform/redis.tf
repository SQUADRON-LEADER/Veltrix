# ── Amazon ElastiCache for Redis (Socket.io adapter + cache) ─────────────────
# Requires the service-linked role elasticache.amazonaws.com in the account.
resource "aws_elasticache_subnet_group" "this" {
  name       = "veltrix-m3-redis"
  subnet_ids = [for s in aws_subnet.data : s.id]
}

resource "aws_elasticache_parameter_group" "this" {
  name        = "veltrix-m3-redis7"
  family      = "redis7"
  description = "Veltrix M3 Redis 7 parameters"
}

resource "aws_elasticache_replication_group" "this" {
  replication_group_id       = "veltrix-m3-redis"
  description                = "Veltrix Socket.io adapter and cache"
  engine                     = "redis"
  engine_version             = "7.1"
  node_type                  = "cache.t3.micro"
  num_cache_clusters         = 1
  port                       = 6379
  parameter_group_name       = aws_elasticache_parameter_group.this.name
  subnet_group_name          = aws_elasticache_subnet_group.this.name
  security_group_ids         = [aws_security_group.redis.id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  auth_token                 = var.redis_auth_token
  automatic_failover_enabled = false
  apply_immediately          = true
}
