#!/usr/bin/env bash
# =============================================================================
# Veltrix — Blue-Green release helper (Helm)
# Manages only the Helm releases veltrix-blue, veltrix-green and veltrix-router
# in one namespace (default: veltrix). It never touches anything else.
#
#   bluegreen.sh status
#   bluegreen.sh deploy <blue|green> <image-tag> [frontend-tag]   # idle color only
#   bluegreen.sh smoke  <blue|green>
#   bluegreen.sh switch <blue|green>
#   bluegreen.sh rollback                                         # switch to the other color
# =============================================================================

set -euo pipefail

NAMESPACE="${NAMESPACE:-veltrix}"
CHART="${CHART:-$(cd "$(dirname "$0")/../helm/veltrix" && pwd)}"
BACKEND_PORT="${BACKEND_PORT:-5000}"
ROLLOUT_TIMEOUT="${ROLLOUT_TIMEOUT:-5m}"

# Pin the cluster so the script can never act on another kubeconfig context.
# Example: KUBE_CONTEXT=kind-m3-bluegreen infrastructure/scripts/bluegreen.sh status
kubectl() { command kubectl ${KUBE_CONTEXT:+--context "$KUBE_CONTEXT"} "$@"; }
helm() { command helm ${KUBE_CONTEXT:+--kube-context "$KUBE_CONTEXT"} "$@"; }

case "$NAMESPACE" in
  default|kube-system|kube-public|kube-node-lease|blue|green)
    echo "Refusing to use namespace '$NAMESPACE'. Use a dedicated namespace (default: veltrix)." >&2
    exit 2 ;;
esac

usage() { sed -n '2,13p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

valid_color() { [[ "$1" == "blue" || "$1" == "green" ]] || { echo "color must be 'blue' or 'green'" >&2; exit 2; }; }
other_color() { [[ "$1" == "blue" ]] && echo green || echo blue; }

active_color() {
  kubectl -n "$NAMESPACE" get svc veltrix-service -o jsonpath='{.spec.selector.env}' 2>/dev/null || true
}

cmd_status() {
  echo "Namespace:    $NAMESPACE"
  echo "Active color: $(active_color || true)"
  echo
  helm -n "$NAMESPACE" list --filter '^veltrix-(blue|green|router)$' 2>/dev/null || true
  echo
  kubectl -n "$NAMESPACE" get deploy,svc,hpa 2>/dev/null || true
}

cmd_deploy() {
  local color="${1:-}" tag="${2:-}" ftag="${3:-${2:-}}"
  valid_color "$color"
  [[ -n "$tag" ]] || { echo "image tag required (use the Git SHA)" >&2; exit 2; }
  [[ "$tag" != "latest" ]] || { echo "refusing the mutable tag 'latest'" >&2; exit 2; }
  if [[ "$(active_color)" == "$color" && "${FORCE:-0}" != "1" ]]; then
    echo "'$color' is the LIVE color. Deploy to '$(other_color "$color")' instead (or set FORCE=1)." >&2
    exit 3
  fi
  helm upgrade --install "veltrix-$color" "$CHART" \
    --namespace "$NAMESPACE" --create-namespace \
    -f "$CHART/values-$color.yaml" ${VALUES_FILE:+-f "$VALUES_FILE"} \
    --set "backend.image.tag=$tag" --set "frontend.image.tag=$ftag" \
    --wait --timeout "$ROLLOUT_TIMEOUT"
  echo "Deployed $color ($tag). Run: $0 smoke $color"
}

cmd_smoke() {
  local color="${1:-}"; valid_color "$color"
  kubectl -n "$NAMESPACE" rollout status "deploy/veltrix-backend-$color" --timeout="$ROLLOUT_TIMEOUT"
  kubectl -n "$NAMESPACE" run "smoke-$color-$RANDOM" --rm -i --restart=Never --image=busybox:1.36 -- \
    wget -qO- -T 5 "http://veltrix-backend-$color:$BACKEND_PORT/health"
  echo
  echo "Smoke test passed for $color."
}

# Block until the color has at least its configured minimum number of ready replicas,
# so traffic never moves to a half-sized deployment (an HPA scales a new Deployment up
# from 1 to its minimum shortly after install).
wait_for_capacity() {
  local color="$1" want ready deadline=$((SECONDS + 180))
  want="$(kubectl -n "$NAMESPACE" get hpa "veltrix-backend-$color" -o jsonpath='{.spec.minReplicas}' 2>/dev/null || true)"
  [[ -n "$want" ]] || want="$(kubectl -n "$NAMESPACE" get deploy "veltrix-backend-$color" -o jsonpath='{.spec.replicas}')"
  while :; do
    ready="$(kubectl -n "$NAMESPACE" get deploy "veltrix-backend-$color" -o jsonpath='{.status.readyReplicas}')"
    [[ "${ready:-0}" -ge "$want" ]] && break
    (( SECONDS < deadline )) || { echo "$color has ${ready:-0}/$want ready replicas; not switching." >&2; exit 4; }
    sleep 2
  done
  echo "$color has ${ready}/${want} replicas ready."
}

cmd_switch() {
  local color="${1:-}"; valid_color "$color"
  kubectl -n "$NAMESPACE" rollout status "deploy/veltrix-backend-$color" --timeout=2m
  wait_for_capacity "$color"
  local before; before="$(active_color)"
  local start=$SECONDS
  helm upgrade --install veltrix-router "$CHART" \
    --namespace "$NAMESPACE" --create-namespace ${VALUES_FILE:+-f "$VALUES_FILE"} \
    --set deployment.enabled=false --set stable.enabled=true --set "stable.activeColor=$color" \
    --wait --timeout 2m
  echo "Traffic: ${before:-none} -> $color in $((SECONDS - start))s"
}

cmd_rollback() {
  local current; current="$(active_color)"
  [[ -n "$current" ]] || { echo "No active color found; nothing to roll back." >&2; exit 3; }
  cmd_switch "$(other_color "$current")"
}

type -P helm >/dev/null || { echo "helm not found" >&2; exit 127; }
type -P kubectl >/dev/null || { echo "kubectl not found" >&2; exit 127; }

case "${1:-}" in
  status)   shift; cmd_status "$@" ;;
  deploy)   shift; cmd_deploy "$@" ;;
  smoke)    shift; cmd_smoke "$@" ;;
  switch)   shift; cmd_switch "$@" ;;
  rollback) shift; cmd_rollback "$@" ;;
  -h|--help|help) usage 0 ;;
  *) usage 2 ;;
esac
