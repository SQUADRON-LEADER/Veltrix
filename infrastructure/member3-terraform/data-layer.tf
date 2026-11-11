# ── Amazon DocumentDB (MongoDB-compatible) ───────────────────────────────────
resource "aws_docdb_subnet_group" "this" {
  name       = "veltrix-m3-docdb"
  subnet_ids = [for s in aws_subnet.data : s.id]
}

resource "aws_docdb_cluster_parameter_group" "this" {
  name        = "veltrix-m3-docdb-params"
  family      = "docdb5.0"
  description = "Veltrix M3 DocumentDB parameters (TLS enforced)"

  parameter {
    name  = "tls"
    value = "enabled"
  }
}

resource "aws_docdb_cluster" "this" {
  cluster_identifier              = "veltrix-m3-docdb"
  engine                          = "docdb"
  engine_version                  = "5.0.0"
  master_username                 = "veltrixadmin"
  master_password                 = var.docdb_master_password
  db_subnet_group_name            = aws_docdb_subnet_group.this.name
  db_cluster_parameter_group_name = aws_docdb_cluster_parameter_group.this.name
  vpc_security_group_ids          = [aws_security_group.docdb.id]
  storage_encrypted               = true
  backup_retention_period         = 1
  deletion_protection             = var.docdb_deletion_protection
  skip_final_snapshot             = false
  final_snapshot_identifier       = "veltrix-m3-docdb-final"
}

resource "aws_docdb_cluster_instance" "this" {
  identifier         = "veltrix-m3-docdb-1"
  cluster_identifier = aws_docdb_cluster.this.id
  instance_class     = "db.t3.medium"
}
