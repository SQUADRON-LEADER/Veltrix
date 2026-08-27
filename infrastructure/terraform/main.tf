# Terraform Infrastructure as Code (IaC) for Veltrix AWS Architecture
# Enforces the 10 Key AWS Services described in the system architecture

terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# 1. Amazon EC2 / ECS Cluster for API execution engine
resource "aws_ecs_cluster" "veltrix_cluster" {
  name = "veltrix-ecs-cluster-${var.environment}"
}

# 2. Amazon S3 Bucket for direct file uploads & code storage
resource "aws_s3_bucket" "veltrix_code_storage" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "Veltrix Code Storage"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_cors_configuration" "s3_cors" {
  bucket = aws_s3_bucket.veltrix_code_storage.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST", "DELETE", "HEAD"]
    allowed_origins = ["*"]
    max_age_seconds = 3000
  }
}

# 3. Amazon DocumentDB (MongoDB Compatibility) Database Cluster
resource "aws_docdb_cluster" "docdb" {
  cluster_identifier      = "veltrix-docdb-cluster"
  engine                  = "docdb"
  master_username         = var.docdb_username
  master_password         = var.docdb_password
  backup_retention_period = 7
  preferred_backup_window = "07:00-09:00"
  skip_final_snapshot     = true
}

# 4. Amazon CloudFront CDN Distribution for Vite Frontend
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.veltrix_code_storage.bucket_regional_domain_name
    origin_id   = "S3-Veltrix-Frontend"
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-Veltrix-Frontend"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# 5. Application Load Balancer (ALB) with Sticky Sessions for Socket.io
resource "aws_lb" "veltrix_alb" {
  name               = "veltrix-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = var.subnet_ids
}

resource "aws_lb_target_group" "backend_tg" {
  name     = "veltrix-backend-tg"
  port     = 5000
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  stickiness {
    type            = "lb_cookie"
    cookie_duration = 86400
    enabled         = true
  }

  health_check {
    path                = "/aws/status"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_security_group" "alb_sg" {
  name        = "veltrix-alb-sg"
  description = "Allow inbound HTTP/HTTPS traffic"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 6. AWS IAM Role for Backend S3 Read/Write
resource "aws_iam_role" "backend_s3_role" {
  name = "veltrix-backend-s3-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

# 7. AWS CodePipeline & CodeBuild Pipeline
resource "aws_codebuild_project" "veltrix_build" {
  name         = "veltrix-codebuild-project"
  service_role = aws_iam_role.backend_s3_role.arn

  artifacts {
    type = "NO_ARTIFACTS"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:6.0"
    type                        = "LINUX_CONTAINER"
    privileged_mode             = true
  }

  source {
    type            = "GITHUB"
    location        = "https://github.com/yourusername/veltrix.git"
    buildspec       = "buildspec.yml"
  }
}

# 8. Amazon ElastiCache (Redis) Cluster for Socket.io horizontal scaling
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "veltrix-redis-cluster"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
}

# 9. Amazon CloudWatch Log Group
resource "aws_cloudwatch_log_group" "veltrix_logs" {
  name              = "/aws/veltrix/${var.environment}"
  retention_in_days = 30
}

# 10. Amazon Route 53 DNS Record Placeholder
data "aws_route53_zone" "primary" {
  name         = "veltrix-devops.com"
  private_zone = false
}
