# Veltrix Business Continuity & Disaster Recovery Plan

## 1. Scope & Recovery Objectives
This document establishes operational procedures for recovery, state restoration, and failure mitigation for the Veltrix cloud platform.

- **RTO (Recovery Time Objective):** < 15 minutes.
- **RPO (Recovery Point Objective):** < 1 hour.

## 2. Infrastructure Restoration via Terraform
In the event of an availability zone failure or infrastructure loss:
```bash
cd infrastructure/terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

## 3. Node Reconfiguration via Ansible
Once compute instances are reachable:
```bash
cd infrastructure/ansible
ansible-playbook -i inventory.ini playbook.yml
```

## 4. Kubernetes Workload Failover & Rollbacks
If a newly deployed version in the active release namespace introduces errors:
```bash
# Instant zero-downtime rollback to previous stable deployment:
kubectl rollout undo deployment/veltrix-backend-green -n green

# Or switch traffic back to the blue environment:
bash infrastructure/scripts/switch-traffic.sh blue
```

## 5. Storage & Database Snapshots
- Persistent volumes and MongoDB backups are synced periodically to the configured Amazon S3 backup bucket.
- To verify S3 bucket backup status:
```bash
aws s3 ls s3://veltrix-production-storage-bucket/backups/
```
