# Site audit — September 27, 2026

## Checked

- The live homepage, About, Owners, Featured Gear, New Arrivals, Sold Archive, Repair Information, `robots.txt`, and `sitemap.xml` returned HTTP 200 with expected content types.
- A mobile homepage screenshot was reviewed; navigation and major sections rendered without obvious clipping. Desktop and mobile behavior still deserves real-device review.
- Automated browser accessibility checks on the homepage, New Arrivals, and Repair Information reported no WCAG A/AA violations. This is not a full accessibility certification. Text contrast over imagery needs human review.
- A local link and asset crawl of all seven public HTML pages found no missing local references.
- One synthetic browser performance run on the homepage reported zero layout shift and fast local metrics. It is not field Core Web Vitals data and should not be presented as user performance.
- The local gear editor opened, imported the current empty inventory, added and edited a sample item, and re-imported the original empty file. The sample was not published.
- The deployment script passed shell syntax checking and an AWS S3 dry run with no unintended uploads.

## Highest-priority gaps

1. **Contact:** `site-config.json` has no public email, phone, address, or hours. Visitors currently have no reliable inquiry path. The repair page now shows an honest holding message while email is blank and automatically shows a mail link once a verified address is configured. Confirm other public details and whether visits require an appointment before publishing a contact page. `drafts/contact.html` is excluded from deployment until reviewed.
2. **Inventory:** `inventory.json` is empty. Add only real, approved gear and photos. The local editor is available at `tools/gear-editor.html`.
3. **Business claims:** Confirm owner story, the newly stated all-brand repair and free-estimate policy, hero-image accuracy, and visit policy with the business before strengthening site copy or structured data.
4. **Search:** Titles, descriptions, canonical URLs, robots rules, and sitemap exist. Submit the sitemap in Google Search Console and ensure verified business listings match the site. Do not add unverified address, hours, phone, or `LocalBusiness` details.
5. **Deployment:** GitHub validates pushes and pull requests without deploying them. Its `production` environment requires owner review from `main` for manual deployment. An IAM administrator must establish the OIDC role before that path can be used. Until then, use the documented manual deployment process.

## Follow-up verification

The shared release validator passes for the current repo. The repair page was tested locally with no email and with a browser-only mocked email; the test address was neither saved nor published. The mobile navigation opened correctly, and the updated repair page had no automated WCAG A/AA violations. Image-background contrast still needs human review.

The repair-page fallback and shared JavaScript were released from commit `7d32092`. CloudFront invalidation completed, and both live files matched the repository bytes. The pre-release S3 backup was retained.

## Limits

No checkout, lead form, analytics, or real inventory flow was tested because those features or content are not present. Automated accessibility and one synthetic performance run cannot replace human accessibility review or real-user metrics.
