#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
profile="${AWS_PROFILE:-kubaki}"
bucket="vintagehifiboise.com"
distribution="E16O0KIL2XTJRC"
expected_account="502882675592"

if [[ "${1:-}" != "" && "${1:-}" != "--dry-run" ]]; then
  echo "Usage: scripts/deploy.sh [--dry-run]" >&2
  exit 2
fi

account="$(aws sts get-caller-identity --profile "$profile" --query Account --output text)"
if [[ "$account" != "$expected_account" ]]; then
  echo "AWS profile $profile belongs to account $account, expected $expected_account." >&2
  exit 1
fi

sync_args=(
  --exclude '*'
  --include '*.html'
  --include 'assets/*'
  --include 'hero.jpg'
  --include 'favicon.svg'
  --include 'inventory.json'
  --include 'site-config.json'
  --include 'robots.txt'
  --include 'sitemap.xml'
  --profile "$profile"
)

if [[ "${1:-}" == "--dry-run" ]]; then
  aws s3 sync "$repo_root/" "s3://$bucket" "${sync_args[@]}" --dryrun
  exit
fi

backup_root="${SITE_BACKUP_DIR:-$(dirname "$repo_root")/backups}"
backup_dir="$backup_root/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup_dir"
aws s3 sync "s3://$bucket" "$backup_dir" --profile "$profile"
echo "Backup saved to $backup_dir"

aws s3 sync "$repo_root/" "s3://$bucket" "${sync_args[@]}"
aws cloudfront create-invalidation \
  --distribution-id "$distribution" \
  --paths '/*' \
  --profile "$profile" \
  --query 'Invalidation.{Id:Id,Status:Status}' \
  --output json
