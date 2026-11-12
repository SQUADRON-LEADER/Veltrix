# IAM Roles and Policies for Veltrix Compute Fleet
# Author: Aayush | Domain: Cloud Infrastructure, IAM Least Privilege

resource "aws_iam_role" "veltrix_node_role" {
  name = "veltrix-node-role"

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

  tags = {
    Name        = "veltrix-node-role"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Owner       = "Aayush"
  }
}

resource "aws_iam_role_policy_attachment" "node_ecr_read" {
  role       = aws_iam_role.veltrix_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

resource "aws_iam_role_policy_attachment" "node_ssm_core" {
  role       = aws_iam_role.veltrix_node_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "veltrix_node_profile" {
  name = "veltrix-node-instance-profile"
  role = aws_iam_role.veltrix_node_role.name
}
