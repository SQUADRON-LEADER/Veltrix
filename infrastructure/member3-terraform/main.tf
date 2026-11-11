# Member 3 — security, storage, data and caching layer for Veltrix.
#
# Self-contained root with its OWN state. It only READS Aayush's VPC and node
# security group (data sources) and only CREATES resources named veltrix-m3-*.
# Never run `terraform apply` in ../terraform from this machine.

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

  # Owner=member3 is what the veltrix-m3-builder IAM policy keys on: it can only
  # modify or delete network objects carrying this tag.
  default_tags {
    tags = {
      Project   = "veltrix"
      Owner     = "member3"
      ManagedBy = "terraform-member3"
    }
  }
}

data "aws_caller_identity" "me" {}

# ── Read-only lookups of existing infrastructure ─────────────────────────────
data "aws_vpc" "veltrix" {
  filter {
    name   = "tag:Name"
    values = ["veltrix-vpc-production"]
  }
}

# ── Private data subnets: local route only, no internet route, no NAT ────────
resource "aws_subnet" "data" {
  for_each          = var.data_subnets
  vpc_id            = data.aws_vpc.veltrix.id
  cidr_block        = each.value
  availability_zone = "${var.aws_region}${each.key}"

  tags = { Name = "veltrix-m3-data-${each.key}" }
}

resource "aws_route_table" "data" {
  vpc_id = data.aws_vpc.veltrix.id

  tags = { Name = "veltrix-m3-data-rt" }
}

resource "aws_route_table_association" "data" {
  for_each       = aws_subnet.data
  subnet_id      = each.value.id
  route_table_id = aws_route_table.data.id
}

# ── Security groups: only members of the dedicated clients SG may reach the data layer ──
# Hosts that need DocumentDB/Redis (the test host, later app nodes) join this group.
# Deliberately NOT Aayush's shared veltrix-ec2-sg, which is open to the internet.
resource "aws_security_group" "clients" {
  name        = "veltrix-m3-clients-sg"
  description = "Hosts allowed to reach the Veltrix M3 data layer (no inbound)"
  vpc_id      = data.aws_vpc.veltrix.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "veltrix-m3-clients-sg" }
}

resource "aws_security_group" "docdb" {
  name        = "veltrix-m3-docdb-sg"
  description = "DocumentDB: 27017 from Veltrix nodes only"
  vpc_id      = data.aws_vpc.veltrix.id

  ingress {
    description     = "MongoDB protocol from M3 clients SG"
    from_port       = 27017
    to_port         = 27017
    protocol        = "tcp"
    security_groups = [aws_security_group.clients.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "veltrix-m3-docdb-sg" }
}

resource "aws_security_group" "redis" {
  name        = "veltrix-m3-redis-sg"
  description = "ElastiCache Redis: 6379 from Veltrix nodes only"
  vpc_id      = data.aws_vpc.veltrix.id

  ingress {
    description     = "Redis from M3 clients SG"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.clients.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "veltrix-m3-redis-sg" }
}
