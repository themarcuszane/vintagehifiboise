# Boise Hi-Fi Stereo website

A dependency-free static site for [www.vintagehifiboise.com](https://www.vintagehifiboise.com/). It is live from S3 through CloudFront. GitHub stores the source; pushes do not automatically deploy it. See [HANDOFF.md](HANDOFF.md) for reviewer context, [AUDIT.md](AUDIT.md) for checks and open issues, and [DEPLOYMENT.md](DEPLOYMENT.md) for release and rollback.

## Before the next content release

1. Fill in `site-config.json` with public email, phone, address, and hours. Leave any field blank if it should not appear. Confirm whether visitors may walk in or need an appointment, then make that clear on the site.
2. Confirm the copy on `about.html`, `owners.html`, and `repair.html`, especially what repair work is actually offered. Add owner names and photos if desired.
3. Add real gear to `inventory.json`. No example inventory is published by default. The offline editor at `tools/gear-editor.html` can prepare the JSON without hand-editing it.
4. Run `python3 scripts/validate_site.py`, test the pages on desktop and mobile, and use `scripts/deploy.sh --dry-run` to review the upload set before release.
5. Submit `sitemap.xml` in Google Search Console and update the business's public listings with matching verified details.

The published `site-config.json` currently has no contact details and `inventory.json` has no items. Do not invent business information or gear to fill these gaps.

The repair page displays a holding message while the public email is blank. Once a verified address is added to `site-config.json`, it shows an email link automatically. No test address is committed or published.

## Updating gear

Open `tools/gear-editor.html` in a browser, choose the repository's `inventory.json`, add or edit items, and download the replacement file. Replace `inventory.json` in the repository with that download, then add every referenced photo under `gear/`. The editor is local-only; it does not save to GitHub or publish the site. Review the JSON and photos before committing or deploying. You can also edit the JSON directly. Each item can contain:

```json
{
  "id": "unique-item-id",
  "brand": "Brand",
  "model": "Model",
  "category": "Receiver",
  "price": "$000",
  "condition": "Describe cosmetic and operating condition",
  "notes": "What is included and what work has been done",
  "image": "/gear/your-photo.jpg",
  "status": "available",
  "featured": true,
  "date_added": "2026-09-26"
}
```

The 12 most recent `status: "available"` items appear in New Arrivals. `featured: true` also shows an available item on Featured Gear. Changing `status` to `"sold"` moves it to Sold Archive. New Arrivals sort newest first by `date_added`. Keep item IDs unique, upload the referenced photo, and publish the revised JSON file. Do not include customer information in the archive. If a photo is not ready, leave `image` blank to use the site's text placeholder.

## Preview locally

From the repository root, run `python3 -m http.server 8000` and open `http://localhost:8000/`. Opening HTML files directly from disk will not load the JSON data because browsers restrict local `fetch` requests.

## Deployment

Run `scripts/deploy.sh --dry-run` to preview changes, then `scripts/deploy.sh` to back up the current bucket, upload site files, and refresh CloudFront. The script uses the verified `kubaki` AWS profile by default; set `AWS_PROFILE` if another authorized profile is needed. It does not delete old objects or upload repository internals, drafts, the editor, or documentation. A manual GitHub Actions workflow is staged behind a production approval gate but cannot deploy until its AWS OIDC role is configured. See [DEPLOYMENT.md](DEPLOYMENT.md) for details.
