# 🚀 Veltrix — DevOps Master Plan

> **Note**: The complete, dependency-driven, 10-phase implementation plan with full task assignments, commands, video guides, and presentation choreography is maintained in **[implementation_plan.md](file:///c:/Users/aayus/Desktop/PR%20TEAM/Veltrix/implementation_plan.md)**.

## 👥 Equal 33.3% Team Assignment Overview

| Member | Domain & Ownership | Primary Tools | Video Deliverables |
|:---|:---|:---|:---|
| **Aayush** | **Cloud IaC & Kubernetes Platform Lead** | AWS VPC, Terraform (VPC/EC2/ALB/SGs), Kubernetes (`kubeadm`), Flannel CNI, Blue-Green Zero-Downtime Deployment | 🎬 **V4, V5, V6** |
| **Member 2** | **CI/CD & Observability Lead** | Docker Multi-Stage Builds, Jenkins LTS (7 Stages), SonarQube SAST & Quality Gate, Prometheus, Grafana, Alertmanager | 🎬 **V1, V2, V3** |
| **Member 3** | **Security, Automation & Elastic Scaling Lead** | AWS Security (IAM, ECR, Bastion Host), Ansible Configuration Management, Helm Charts, Kubernetes HPA + Metrics Server | 🎬 **V7, V8, V9** |

---

## 🔄 10-Phase Chronological Execution Flow

1. **Phase 1: Cloud Foundation & Network Isolation** — AWS VPC, Subnets, Internet Gateway, NAT Gateway, Security Groups, IAM Roles, ECR (*Lead: Aayush & Member 3*)
2. **Phase 2: Compute Fleet Provisioning & Bastion Hardening** — 8 EC2 Instances via Terraform, SSH ProxyJump Bastion configuration (*Lead: Aayush & Member 3*)
3. **Phase 3: Automated Node Bootstrapping via Ansible** — Idempotent playbooks for Docker, Java, Node Exporter, K8s packages across all 8 nodes (*Lead: Member 3*)
4. **Phase 4: Containerization & Registry Baselining** — Multi-stage Dockerfiles (`backend` & `frontend`), local Compose verification, Amazon ECR baseline push (*Lead: Member 2*)
5. **Phase 5: Kubernetes Cluster Bootstrapping & CNI** — `kubeadm init`, join worker nodes, Flannel CNI overlay, Kubernetes Metrics Server deployment (*Lead: Aayush*)
6. **Phase 6: CI/CD Pipeline & Static Code Inspection** — SonarQube LTS setup, custom Quality Gate enforcement, 7-stage Declarative Jenkinsfile, GitHub Webhook (*Lead: Member 2*)
7. **Phase 7: Cloud-Native Packaging & Blue-Green Traffic Routing** — Helm chart templates (`values-blue.yaml`, `values-green.yaml`), instant Service selector patch, 5-second rollback (*Lead: Aayush & Member 3*)
8. **Phase 8: Elastic Auto-Scaling & Load Testing** — Kubernetes HPA, CPU stress test script, live scale-out (2 -> 4 -> 6 replicas) and cooldown (*Lead: Member 3*)
9. **Phase 9: Comprehensive Observability & Automated Alerting** — Prometheus multi-target scraping (8 EC2s, Jenkins, K8s), 3 custom Grafana dashboards, Alertmanager incident alert firing (*Lead: Member 2*)
10. **Phase 10: Full Dry-Run Rehearsal, 9 Video Deliverables & Review Prep** — End-to-end commit-to-green traffic run, record 9 demo videos, live review presentation practice (*All Members*)

For full technical details, manifest trees, commands, and review viva defense answers, see [implementation_plan.md](file:///c:/Users/aayus/Desktop/PR%20TEAM/Veltrix/implementation_plan.md).
