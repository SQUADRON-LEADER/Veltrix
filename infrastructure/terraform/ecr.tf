# Amazon Elastic Container Registry (ECR) Repositories
# Author: Aayush | Domain: Cloud Infrastructure & Container Registry Management

resource "aws_ecr_repository" "veltrix_backend" {
  name                 = "veltrix-backend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "veltrix-backend-ecr"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "Aayush"
  }
}

resource "aws_ecr_repository" "veltrix_frontend" {
  name                 = "veltrix-frontend"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name        = "veltrix-frontend-ecr"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "Aayush"
  }
}

resource "aws_ecr_lifecycle_policy" "veltrix_backend_policy" {
  repository = aws_ecr_repository.veltrix_backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep last 10 production images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}
