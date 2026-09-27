# Deployment and recovery

## Hosting

`www.vintagehifiboise.com` and the apex domain use CloudFront distribution `E16O0KIL2XTJRC`. Its origin is the `vintagehifiboise.com` S3 static website bucket in `us-west-2`, with `index.html` as the index document. The `www.vintagehifiboise.com` S3 bucket is not the site origin. GitHub currently stores source only; pushes do not change the live site.

The first version from this repository was uploaded on September 26, 2026 from commit `80e47b6`. CloudFront invalidation `I85GX09BLF93P8I8KSLUIIGC4C` completed. The prior site files were backed up locally before that upload.

## Release

1. Confirm `site-config.json`, `inventory.json`, photos, and page copy contain only approved public information.
2. Run `node --check assets/site.js`, `jq empty inventory.json site-config.json`, and `xmllint --noout sitemap.xml`.
3. Preview locally and test the menu and all pages.
4. Run `scripts/deploy.sh --dry-run` and review the exact upload list.
5. Run `scripts/deploy.sh`. It checks the AWS account, saves a timestamped local backup, uploads only site files without deleting existing keys, and starts a CloudFront invalidation.
6. Wait for the reported invalidation to complete, then check the public homepage, listing pages, CSS, JavaScript, JSON, sitemap, and mobile layout.

The script needs AWS CLI access to account `502882675592`. The `kubaki` profile worked for the September 26 deployment. No credential is stored in this repository. If access expires, authenticate through the normal AWS process; do not put keys in files or GitHub.

## Rollback

S3 versioning was not enabled when checked on September 26, 2026. Keep the script's local backup until the next release is verified. To restore a backup, first review its contents, then sync it to the site bucket without `--delete` and create a new CloudFront invalidation:

```sh
aws s3 sync /path/to/reviewed-backup/ s3://vintagehifiboise.com --profile kubaki
aws cloudfront create-invalidation --distribution-id E16O0KIL2XTJRC --paths '/*' --profile kubaki
```

This restores overwritten files but leaves any new keys in place. Remove unwanted new keys only after checking them individually.

## Deployment boundaries

The upload script includes `*.html`, `assets/*`, `hero.jpg`, `inventory.json`, `site-config.json`, `robots.txt`, and `sitemap.xml`. It excludes repository internals and documentation. If a new image directory or asset type is added, update the script's include rules before deploying it.
