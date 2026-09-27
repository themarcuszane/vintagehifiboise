# Boise Hi-Fi Stereo — reviewer handoff

Updated September 27, 2026. Prepared for a fresh review of the website and its deployment. No reviewer changes have been requested or made here.

## Links and ownership map

| Resource | Location | Purpose |
| --- | --- | --- |
| Live site | https://www.vintagehifiboise.com/ | Public website; verified HTTP 200 on September 27 |
| Source repository | https://github.com/themarcuszane/vintagehifiboise | Public GitHub repo, `main` branch |
| Source state | `main` branch | Includes the site, deployment docs, and editing tools |
| Project README | [README.md](README.md) | Content editing and local preview |
| Deployment guide | [DEPLOYMENT.md](DEPLOYMENT.md) | Hosting, release, and rollback |
| Deployment script | [scripts/deploy.sh](scripts/deploy.sh) | Backs up S3, uploads site files, invalidates CloudFront |
| Audit | [AUDIT.md](AUDIT.md) | Test results, limits, and content gaps |
| Gear editor | [tools/gear-editor.html](tools/gear-editor.html) | Local-only inventory editor |

The GitHub repo was empty before this project. The previous public site lived directly in S3; its source was not in another known repo. A copy of those original live files was archived separately before replacement. GitHub checks each push and pull request, but never deploys automatically. A manual, approval-gated deployment is staged but cannot run until an AWS OIDC role is created.

## How the site works

- Plain static HTML pages share `assets/site.css` and `assets/site.js`; no framework or build step is required.
- `inventory.json` is the single source for Featured Gear, New Arrivals, and Sold Archive. It is currently `[]`, so those pages show honest empty states.
- `site-config.json` supplies footer contact details. Its fields are currently blank because verified public details were not provided.
- `hero.jpg` came from the original public site. `favicon.svg`, `robots.txt`, and `sitemap.xml` are included.
- The files are hosted in the `vintagehifiboise.com` S3 website bucket in `us-west-2`, behind CloudFront distribution `E16O0KIL2XTJRC`. The similarly named `www.vintagehifiboise.com` bucket is not this distribution's origin.

## What has been done and checked

1. Replaced the image-only homepage with readable copy, visible desktop navigation, mobile navigation, and paths to gear and information pages.
2. Added working New Arrivals, Sold Archive, and Repair Information pages where the old links returned 404.
3. Added titles, descriptions, canonical URLs, a sitemap, robots rules, and basic organization data.
4. Tested desktop and mobile rendering, navigation, and sample inventory filtering. The homepage had no automated WCAG A/AA violations in the browser audit; image-overlay contrast still merits a human check.
5. Uploaded the site to S3, completed CloudFront invalidation, and verified the homepage, previously broken routes, assets, JSON, and favicon load on the public domain.
6. Added a deployment script with an AWS account check, local backup, targeted upload set, and cache invalidation. Its dry run completed successfully.
7. Added a local gear editor, an excluded contact-page draft, an audit, and a manual GitHub deployment workflow. Configured the GitHub `production` environment to require owner review from `main`. AWS IAM permissions are still needed for the role.
8. Added a shared release validator and a repair-page fallback that avoids pointing visitors to an absent email address. Published that repair page and JavaScript from commit `7d32092`; CloudFront invalidation completed and live bytes matched the source. The public email and inventory remain blank.

## Reviewer priorities

1. **Business facts:** Confirm name, actual location, contact details, opening hours, appointment policy, owner names, and whether the hero image accurately represents the business.
2. **Repair claims:** A concurrent update to `repair.html` states all brands are accepted and estimates are free. Confirm these claims with the business. The page now displays a holding message while email is blank and an email link once a verified address is configured; no contact address has been invented.
3. **Inventory:** Add real models, prices if desired, condition notes, photos, and availability. Check that new, featured, and sold views reflect real stock.
4. **Content and design:** Review copy for the shop's voice, mobile legibility, image contrast, and the contact path. The current site cannot receive inquiries until public contact information is added.
5. **Search and operations:** Verify business listings, submit the sitemap in Google Search Console, approve the contact-page draft only after confirming real details, and have an AWS IAM administrator review and create the narrowly scoped GitHub deployment role.

## Release caution

Changing GitHub alone does not update the public domain. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for the current manual release process. The script does not delete old S3 keys. S3 versioning was not enabled when checked, so retain each pre-release backup and review any rollback before uploading it. Do not commit credentials, private contact details, or invented inventory.
