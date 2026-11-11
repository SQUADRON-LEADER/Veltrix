# ── Single-node kubeadm cluster host for the Helm / blue-green / HPA demo ─────
# Isolated from Aayush's instances: its own security group with NO inbound rules
# (access is through AWS Systems Manager Session Manager), no key pair, IMDSv2 only.
# Joined to veltrix-m3-clients-sg so pods can reach DocumentDB and ElastiCache.
# Pod network CIDR 10.244.0.0/16 (Flannel) is set at `kubeadm init`.

data "aws_subnet" "public_1" {
  vpc_id = data.aws_vpc.veltrix.id
  filter {
    name   = "tag:Name"
    values = ["veltrix-public-1-production"]
  }
}

data "aws_ssm_parameter" "ubuntu_2204" {
  name = "/aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id"
}

resource "aws_security_group" "k8s" {
  name        = "veltrix-m3-k8s-sg"
  description = "Veltrix M3 kubeadm node: no inbound, SSM access only"
  vpc_id      = data.aws_vpc.veltrix.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "veltrix-m3-k8s-sg" }
}

resource "aws_instance" "k8s" {
  ami                         = data.aws_ssm_parameter.ubuntu_2204.value
  instance_type               = var.k8s_instance_type
  subnet_id                   = data.aws_subnet.public_1.id
  vpc_security_group_ids      = [aws_security_group.k8s.id, aws_security_group.clients.id]
  iam_instance_profile        = aws_iam_instance_profile.node.name
  associate_public_ip_address = true # outbound only: package repos, image registries, SSM

  # Hop limit 2 lets pods use the node's instance role (S3 access without keys).
  metadata_options {
    http_endpoint               = "enabled"
    http_tokens                 = "required"
    http_put_response_hop_limit = 2
  }

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
    encrypted   = true
  }

  tags = { Name = "veltrix-m3-k8s" }
}
