# Terraform Infrastructure as Code (IaC) for Veltrix AWS Architecture
# Author: Aayush | Domain: Cloud Infrastructure, VPC, EC2 Fleet, ALB, & Security

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
  region                      = var.aws_region
  skip_credentials_validation = true
  skip_requesting_account_id  = true
  skip_metadata_api_check     = true
}

# 1. AWS VPC & Network Isolation
resource "aws_vpc" "veltrix_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name        = "veltrix-vpc-${var.environment}"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_internet_gateway" "veltrix_igw" {
  vpc_id = aws_vpc.veltrix_vpc.id

  tags = {
    Name        = "veltrix-igw-${var.environment}"
    Environment = var.environment
  }
}

resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.veltrix_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = {
    Name = "veltrix-public-1-${var.environment}"
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.veltrix_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "veltrix-public-2-${var.environment}"
  }
}

resource "aws_route_table" "public_rt" {
  vpc_id = aws_vpc.veltrix_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.veltrix_igw.id
  }

  tags = {
    Name = "veltrix-public-rt"
  }
}

resource "aws_route_table_association" "public_1_assoc" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_rt.id
}

resource "aws_route_table_association" "public_2_assoc" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}

# 2. Security Groups: ALB, Jenkins, Kubernetes
resource "aws_security_group" "alb_sg" {
  name        = "veltrix-alb-sg"
  description = "Allow inbound HTTP/HTTPS traffic"
  vpc_id      = aws_vpc.veltrix_vpc.id

  ingress {
    description = "HTTP Public"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS Public"
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

  tags = {
    Name = "veltrix-alb-sg"
  }
}

resource "aws_security_group" "ec2_sg" {
  name        = "veltrix-ec2-sg"
  description = "Security group for Veltrix EC2 fleet (Jenkins, Kubeadm Master & Workers)"
  vpc_id      = aws_vpc.veltrix_vpc.id

  ingress {
    description = "SSH from Bastion"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Jenkins Web UI"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description     = "Traffic from ALB"
    from_port       = 5000
    to_port         = 5000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. Application Load Balancer (ALB)
resource "aws_lb" "veltrix_alb" {
  name               = "veltrix-alb-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "veltrix-alb-${var.environment}"
  }
}

resource "aws_lb_target_group" "backend_tg" {
  name     = "veltrix-backend-tg"
  port     = 5000
  protocol = "HTTP"
  vpc_id   = aws_vpc.veltrix_vpc.id

  health_check {
    path                = "/health"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.veltrix_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend_tg.arn
  }
}

# 4. Amazon S3 Storage Bucket
resource "aws_s3_bucket" "veltrix_code_storage" {
  bucket = var.s3_bucket_name

  tags = {
    Name        = "Veltrix Code Storage"
    Environment = var.environment
  }
}

# 5. Amazon ECS Cluster for Microservices Engine
resource "aws_ecs_cluster" "veltrix_cluster" {
  name = "veltrix-ecs-cluster-${var.environment}"
}

# 6. AWS IAM Role for Compute Nodes & Services
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

# 7. Amazon CloudWatch Log Group
resource "aws_cloudwatch_log_group" "veltrix_logs" {
  name              = "/aws/veltrix/${var.environment}"
  retention_in_days = 30
}

# 8. EC2 Fleet Instances (Jenkins, Kubernetes Master & Workers)
resource "aws_instance" "jenkins_controller" {
  ami           = var.ami_id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public_subnet_1.id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  tags = {
    Name = "veltrix-jenkins-controller"
    Role = "CI-CD-Controller"
  }
}

resource "aws_instance" "k8s_master" {
  ami           = var.ami_id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.public_subnet_1.id
  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  tags = {
    Name = "veltrix-k8s-master"
    Role = "Kubernetes-Control-Plane"
  }
}
