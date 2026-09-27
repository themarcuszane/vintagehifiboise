# Deployment and recovery

## Hosting

`www.vintagehifiboise.com` and the apex domain use CloudFront distribution `E16O0KIL2XTJRC`. Its origin is the `vintagehifiboise.com` S3 static website bucket in `us-west-2`, with `index.html` as the index document. The `www.vintagehifiboise.com` S3 bucket is not the site origin. GitHub pushes do not change the live site.

The first version from this repository was uploaded on September 26, 2026 from commit `80e47b6`. CloudFront invalidation `I85GX09BLF93P8I8KSLUIIGC4C` completed. The prior site files were backed up locally before that upload.

## Release

1. Confirm `site-config.json`, `inventory.json`, photos, and page copy contain only approved public information.
2. Run `node --check assets/site.js`, `jq empty inventory.json site-config.json`, and `xmllint --noout sitemap.xml`.
3. Preview locally and test the menu and all pages.
4. Run `scripts/deploy.sh --dry-run` and review the exact upload list.
5. Run `scripts/deploy.sh`. It checks the AWS account, saves a timestamped local backup, uploads only site files without deleting existing keys, and waits for the CloudFront invalidation to complete.
6. Check the public homepage, listing pages, CSS, JavaScript, JSON, sitemap, and mobile layout.

The script needs AWS CLI access to account `502882675592`. The `kubaki` profile worked for the September 26 deployment. No credential is stored in this repository. If access expires, authenticate through the normal AWS process; do not put keys in files or GitHub.

## Reviewed GitHub deployment (not active yet)

`.github/workflows/deploy.yml` is a **manual** `workflow_dispatch` workflow; pushes alone never deploy. Its validation job checks script and JavaScript syntax, JSON structure, unique gear IDs, referenced photos, and sitemap XML. The deploy job waits for approval in the GitHub `production` environment, which requires review by `themarcuszane` and only permits `main`. After approval, it uses short-lived AWS OIDC credentials, previews the upload, runs the same deployment script, and retains a pre-deploy S3 backup as a GitHub artifact for 30 days. Do not run it until the following prerequisite is complete.

An AWS IAM administrator must create or verify the GitHub OIDC provider `token.actions.githubusercontent.com` in account `502882675592` with audience `sts.amazonaws.com`, then create a deploy role using `ops/github-deploy-trust-policy.json` and attach `ops/github-deploy-permissions-policy.json`. Review these policies against the account before applying them. The trust policy limits assumption to this repository's `production` environment; the environment limits the branch and requires review. Add the resulting role ARN as repository Actions variable `AWS_DEPLOY_ROLE_ARN`. Do not use a long-lived access key. The currently available `kubaki` profile can deploy the site but was denied IAM OIDC-provider listing, so this role was **not** created and the variable is **not** set. No GitHub deployment has been run.

The workflow's backup artifact may contain all files already in the site bucket. Review bucket contents and repository artifact access before the first run. If the bucket contains nonpublic files, establish a private backup destination instead. Prefer enabling S3 versioning as an additional rollback safeguard after reviewing costs and retention.

## Rollback

S3 versioning was not enabled when checked on September 26, 2026. Keep the script's local backup until the next release is verified. To restore a backup, first review its contents, then sync it to the site bucket without `--delete` and create a new CloudFront invalidation:

```sh
aws s3 sync /path/to/reviewed-backup/ s3://vintagehifiboise.com --profile kubaki
aws cloudfront create-invalidation --distribution-id E16O0KIL2XTJRC --paths '/*' --profile kubaki
```

This restores overwritten files but leaves any new keys in place. Remove unwanted new keys only after checking them individually.

## Deployment boundaries

The upload script includes the seven approved root HTML pages, `assets/*`, `gear/*`, `hero.jpg`, `favicon.svg`, `inventory.json`, `site-config.json`, `robots.txt`, and `sitemap.xml`. It excludes repository internals, drafts, the gear editor, and documentation. If a new public page or asset type is added, update the script's include rules before deploying it. In particular, `drafts/contact.html` is only a template: after real contact details and visit policy are confirmed, move it to the root as `contact.html`, add navigation and sitemap links, and explicitly include it in the deploy script.
