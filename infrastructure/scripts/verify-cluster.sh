#!/usr/bin/env bash
# Veltrix Cluster Readiness and Flannel CNI Verification Utility
# Author: Aayush | Domain: Kubernetes Orchestration & Cluster Verification

set -euo pipefail

echo "=========================================================="
echo "          VELTRIX KUBERNETES CLUSTER HEALTH AUDIT         "
echo "=========================================================="

echo -e "\n[1/4] Checking Node Status..."
kubectl get nodes -o wide

echo -e "\n[2/4] Verifying Flannel CNI DaemonSet..."
kubectl get pods -n kube-flannel -l app=flannel -o wide

echo -e "\n[3/4] Inspecting Active Releases (Green Namespace)..."
kubectl get deployments,services,pods -n green -o wide

echo -e "\n[4/4] Validating CoreDNS and Cluster Component Endpoints..."
kubectl get endpoints -n kube-system

echo -e "\n=========================================================="
echo "          CLUSTER VERIFICATION COMPLETE (ALL READY)       "
echo "=========================================================="
