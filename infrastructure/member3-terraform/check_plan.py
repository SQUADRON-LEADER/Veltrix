#!/usr/bin/env python3
"""Safety gate for the Member 3 Terraform root.

Reads `terraform show -json <planfile>` on stdin and exits non-zero unless every
change is a pure create (or no-op). Any update, delete or replace of any
resource - ours or not - fails the gate, so an apply can never modify or
destroy something that already exists.

Usage:
  terraform plan -out=PLAN && terraform show -json PLAN | python3 check_plan.py

`--allow-update ADDRESS` (repeatable) permits an in-place update (never delete or
replace) of that one resource. Review the diff before using it.

Narrow opt-in: `--allow-fill ADDRESS` (repeatable) permits an in-place update of
that one resource, but only when every changed attribute goes from empty to
non-empty (pure additions, e.g. completing a half-created security group).
"""
import json
import sys

allow_fill = set()
allow_update = set()
args = sys.argv[1:]
while args:
    if args[0] == "--allow-fill" and len(args) > 1:
        allow_fill.add(args[1])
        args = args[2:]
    elif args[0] == "--allow-update" and len(args) > 1:
        allow_update.add(args[1])
        args = args[2:]
    else:
        sys.exit(f"unknown argument: {args[0]}")


def is_pure_fill(change):
    before, after = change["before"] or {}, change["after"] or {}
    changed = [k for k in set(before) | set(after) if before.get(k) != after.get(k)]
    return bool(changed) and all(before.get(k) in (None, [], {}, "") for k in changed)


plan = json.load(sys.stdin)
creates, fills, bad = [], [], []

for rc in plan.get("resource_changes", []):
    actions = rc["change"]["actions"]
    addr = rc["address"]
    if actions == ["create"]:
        creates.append(addr)
    elif actions in (["no-op"], ["read"]):
        continue
    elif actions == ["update"] and addr in allow_fill and is_pure_fill(rc["change"]):
        fills.append(addr)
    elif actions == ["update"] and addr in allow_update:
        fills.append(addr)
    else:
        bad.append((addr, actions))

print(f"{len(creates)} resource(s) to create:")
for a in creates:
    print(f"  + {a}")

for a in fills:
    print(f"  ~ {a} (in-place update, explicitly allowed)")

if bad:
    print("\nBLOCKED - the plan changes or destroys existing resources:")
    for addr, actions in bad:
        print(f"  ! {addr}: {','.join(actions)}")
    sys.exit(1)

print(f"\nGATE PASSED: {len(creates)} create, {len(fills)} fill-only update, 0 destroy.")
