#!/usr/bin/env bash
# Veltrix Zero-Downtime Blue/Green Traffic Cutover Utility
# Author: Aayush | Domain: Kubernetes Networking & Release Engineering

set -euo pipefail

TARGET_COLOR="${1:-green}"

if [[ "$TARGET_COLOR" != "blue" && "$TARGET_COLOR" != "green" ]]; then
    echo "Usage: $0 [blue|green]"
    exit 1
fi

echo "=========================================================="
echo "  SWITCHING ACTIVE TRAFFIC TO: ${TARGET_COLOR^^} RELEASE  "
echo "=========================================================="

kubectl patch service veltrix-stable-service \
  -p "{\"spec\":{\"selector\":{\"app\":\"veltrix-backend\",\"version\":\"${TARGET_COLOR}\"}}}"

echo "Service patched successfully. Current endpoints:"
kubectl get endpoints veltrix-stable-service -o wide
