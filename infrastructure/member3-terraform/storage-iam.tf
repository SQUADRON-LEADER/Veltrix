# ── S3: private bucket for repository objects (pre-signed uploads) ───────────
resource "aws_s3_bucket" "artifacts" {
  bucket = "veltrix-m3-artifacts-${data.aws_caller_identity.me.account_id}"

  tags = { Name = "Veltrix M3 Artifacts" }
}

resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket                  = aws_s3_bucket.artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Browser uploads with a pre-signed PUT URL. Tighten allowed_origins to the real
# frontend origin before the demo.
resource "aws_s3_bucket_cors_configuration" "artifacts" {
  bucket = aws_s3_bucket.artifacts.id
  cors_rule {
    allowed_methods = ["PUT", "GET"]
    allowed_origins = var.cors_allowed_origins
    allowed_headers = ["*"]
    max_age_seconds = 3000
  }
}

# Refuse any non-TLS access to the bucket.
resource "aws_s3_bucket_policy" "artifacts_tls_only" {
  bucket     = aws_s3_bucket.artifacts.id
  depends_on = [aws_s3_bucket_public_access_block.artifacts]
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "DenyInsecureTransport"
      Effect    = "Deny"
      Principal = "*"
      Action    = "s3:*"
      Resource  = [aws_s3_bucket.artifacts.arn, "${aws_s3_bucket.artifacts.arn}/*"]
      Condition = { Bool = { "aws:SecureTransport" = "false" } }
    }]
  })
}

# ── IAM: instance role used by Kubernetes nodes / pods (no static keys) ──────
data "aws_iam_policy_document" "ec2_trust" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "node" {
  name               = "veltrix-m3-node-role"
  assume_role_policy = data.aws_iam_policy_document.ec2_trust.json
  description        = "Least-privilege role for Veltrix nodes: scoped S3 access and SSM Session Manager"
}

# Objects only under repos/, and listing only that prefix.
resource "aws_iam_role_policy" "s3_objects" {
  name = "veltrix-m3-s3-repos-prefix"
  role = aws_iam_role.node.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ObjectsUnderReposPrefix"
        Effect   = "Allow"
        Action   = ["s3:PutObject", "s3:GetObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.artifacts.arn}/repos/*"
      },
      {
        Sid       = "ListReposPrefix"
        Effect    = "Allow"
        Action    = "s3:ListBucket"
        Resource  = aws_s3_bucket.artifacts.arn
        Condition = { StringLike = { "s3:prefix" = ["repos/*"] } }
      }
    ]
  })
}

# Shell access without opening SSH.
resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.node.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "node" {
  name = "veltrix-m3-node-profile"
  role = aws_iam_role.node.name
}
