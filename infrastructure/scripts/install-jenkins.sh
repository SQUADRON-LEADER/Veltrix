#!/bin/bash
# =============================================================================
# Veltrix — Automated Jenkins Server Provisioning Script
# Author: Aayush | Module 2: Jenkins CI/CD Infrastructure
# Target OS: Ubuntu 22.04 LTS (EC2 Instance)
# =============================================================================

set -eo pipefail

echo "[1/4] Updating system packages & installing OpenJDK 17..."
sudo apt-get update -y
sudo apt-get install -y openjdk-17-jre curl gnupg lsb-release

echo "[2/4] Adding official Jenkins GPG key & APT repository..."
sudo mkdir -p /usr/share/keyrings
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

echo "[3/4] Installing Jenkins service..."
sudo apt-get update -y
sudo apt-get install -y jenkins

echo "[4/4] Starting and enabling Jenkins on boot..."
sudo systemctl enable --now jenkins

echo "================================================================="
echo "Jenkins installed successfully!"
echo "Service status: $(systemctl is-active jenkins)"
echo "Initial Admin Password:"
echo "sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
echo "================================================================="
