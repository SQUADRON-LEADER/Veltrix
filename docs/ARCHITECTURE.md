# Veltrix Cloud Architecture & Infrastructure Specification

## 1. Executive Overview
Veltrix is a cloud-native enterprise application engineered with a 3-tier microservice architecture, provisioned across AWS with Terraform, configured via Ansible, and continuously delivered through a 7-stage Jenkins pipeline onto a Kubernetes cluster with Flannel CNI.

```
                           [ Internet Traffic ]
                                    │
                                    ▼
                     [ Application Load Balancer ]
                                    │
               ┌────────────────────┴────────────────────┐
               ▼                                         ▼
      [ Public Subnet A ]                       [ Public Subnet B ]
      • Jenkins Controller                      • Bastion / NAT
      • SonarQube Server
               │
               ▼
     [ Private Subnets - Kubernetes Fleet ]
     • K8s Master Node (Control Plane)
     • Flannel CNI Overlay (10.244.0.0/16)
     • Veltrix Backend Workloads (Green / Blue)
     • Amazon ECR Image Registry Integration
```

## 2. Infrastructure as Code (Terraform)
- **VPC & Subnets:** Isolated CIDR `10.0.0.0/16` with distinct public subnets (`10.0.1.0/24`, `10.0.2.0/24`).
- **Compute Resources:** EC2 instances for Jenkins Controller (`t3.medium`) and Kubernetes Master (`t3.medium`).
- **Storage & Artifacts:** S3 bucket for build artifacts and log backups.
- **Container Registry:** Dedicated Amazon ECR repositories with automatic image vulnerability scanning on push.

## 3. Configuration Management (Ansible)
- Idempotent host configuration.
- Container runtime bootstrapping (`containerd`).
- Kernel parameter tuning for Kubernetes overlay networking (`net.bridge.bridge-nf-call-iptables=1`, `net.ipv4.ip_forward=1`).
- Automated Prometheus Node Exporter daemon configuration across all fleet nodes.

## 4. Container Orchestration & Networking
- **Cluster Initialization:** Self-managed `kubeadm` single-control-plane setup.
- **CNI Plugin:** Flannel CNI establishing VXLAN overlay networking across the `10.244.0.0/16` Pod CIDR.
- **Traffic Routing:** Active-passive blue/green release model via target Kubernetes services.

## 5. Continuous Delivery Pipeline (Jenkins)
The release pipeline executes 7 automated stages:
1. **Checkout SCM:** Clones branch based on Git triggers.
2. **Install & Test:** Executes unit and integration test suites.
3. **SonarQube Analysis:** Runs static code analysis, vulnerability scanning, and code smell detection.
4. **Quality Gate:** Enforces zero blocker bugs before build.
5. **Docker Build:** Builds immutable multi-stage container images.
6. **Push Image:** Tags and publishes images to container registry.
7. **Deploy to Kubernetes:** Deploys zero-downtime manifests into the target namespace.
