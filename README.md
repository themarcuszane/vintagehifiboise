# Boise Hi-Fi Stereo website

A dependency-free static site for [www.vintagehifiboise.com](https://www.vintagehifiboise.com/). It is live from S3 through CloudFront. GitHub stores the source; pushes do not automatically deploy it. See [HANDOFF.md](HANDOFF.md) for reviewer context and [DEPLOYMENT.md](DEPLOYMENT.md) for the verified release and rollback process.

## Before the next content release

1. Fill in `site-config.json` with public email, phone, address, and hours. Leave any field blank if it should not appear. Confirm whether visitors may walk in or need an appointment, then make that clear on the site.
2. Confirm the copy on `about.html`, `owners.html`, and `repair.html`, especially what repair work is actually offered. Add owner names and photos if desired.
3. Add real gear to `inventory.json`. No example inventory is published by default.
4. Test every link and page on desktop and mobile. Use `scripts/deploy.sh --dry-run` to review the upload set before release.
5. Submit `sitemap.xml` in Google Search Console and update the business's public listings with matching verified details.

The published `site-config.json` currently has no contact details and `inventory.json` has no items. Do not invent business information or gear to fill these gaps.

## Updating gear

Edit the single `inventory.json` array. Each item can contain:

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

The 12 most recent `status: "available"` items appear in New Arrivals. `featured: true` also shows an available item on Featured Gear. Changing `status` to `"sold"` moves it to Sold Archive. New Arrivals sort newest first by `date_added`. Keep item IDs unique, upload the referenced photo, and publish the revised JSON file. Do not include customer information in the archive.

## Preview locally

From the repository root, run `python3 -m http.server 8000` and open `http://localhost:8000/`. Opening HTML files directly from disk will not load the JSON data because browsers restrict local `fetch` requests.

## Deployment

Run `scripts/deploy.sh --dry-run` to preview changes, then `scripts/deploy.sh` to back up the current bucket, upload site files, and refresh CloudFront. The script uses the verified `kubaki` AWS profile by default; set `AWS_PROFILE` if another authorized profile is needed. It does not delete old objects or upload repository internals and documentation. See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting details and recovery steps.
