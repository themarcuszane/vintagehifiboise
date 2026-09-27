#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
bucket="vintagehifiboise.com"
distribution="E16O0KIL2XTJRC"
expected_account="502882675592"
profile_args=()

if [[ -n "${AWS_PROFILE:-}" ]]; then
  profile_args=(--profile "$AWS_PROFILE")
elif [[ "${GITHUB_ACTIONS:-}" != "true" ]]; then
  profile_args=(--profile kubaki)
fi

if [[ "${1:-}" != "" && "${1:-}" != "--dry-run" ]]; then
  echo "Usage: scripts/deploy.sh [--dry-run]" >&2
  exit 2
fi

account="$(aws sts get-caller-identity "${profile_args[@]}" --query Account --output text)"
if [[ "$account" != "$expected_account" ]]; then
  echo "AWS account $account does not match expected account $expected_account." >&2
  exit 1
fi

sync_args=(
  --exclude '*'
  --include 'index.html'
  --include 'about.html'
  --include 'owners.html'
  --include 'featured.html'
  --include 'new.html'
  --include 'sold.html'
  --include 'repair.html'
  --include 'assets/*'
  --include 'gear/*'
  --include 'hero.jpg'
  --include 'favicon.svg'
  --include 'inventory.json'
  --include 'site-config.json'
  --include 'robots.txt'
  --include 'sitemap.xml'
  "${profile_args[@]}"
)

if [[ "${1:-}" == "--dry-run" ]]; then
  aws s3 sync "$repo_root/" "s3://$bucket" "${sync_args[@]}" --dryrun
  exit
fi

backup_root="${SITE_BACKUP_DIR:-$(dirname "$repo_root")/backups}"
backup_dir="$backup_root/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$backup_dir"
aws s3 sync "s3://$bucket" "$backup_dir" "${profile_args[@]}"
echo "Backup saved to $backup_dir"

aws s3 sync "$repo_root/" "s3://$bucket" "${sync_args[@]}"
invalidation_id="$(aws cloudfront create-invalidation \
  --distribution-id "$distribution" \
  --paths '/*' \
  "${profile_args[@]}" \
  --query 'Invalidation.Id' \
  --output text)"
echo "CloudFront invalidation $invalidation_id started."
aws cloudfront wait invalidation-completed \
  --distribution-id "$distribution" \
  --id "$invalidation_id" \
  "${profile_args[@]}"
echo "CloudFront invalidation $invalidation_id completed."
