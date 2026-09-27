#!/usr/bin/env python3
import json
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlparse
import xml.etree.ElementTree as ElementTree


ROOT = Path(__file__).resolve().parent.parent
PAGES = (
    "index.html",
    "about.html",
    "owners.html",
    "featured.html",
    "new.html",
    "sold.html",
    "repair.html",
)


class LocalReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if tag in ("a", "link", "script", "img"):
            reference = attributes.get("href") or attributes.get("src")
            if reference:
                self.references.append(reference)


def validate_inventory(errors):
    inventory = json.loads((ROOT / "inventory.json").read_text())
    if not isinstance(inventory, list):
        errors.append("inventory.json must contain an array")
        return
    identifiers = set()
    for index, item in enumerate(inventory, start=1):
        label = f"inventory item {index}"
        if not isinstance(item, dict):
            errors.append(f"{label} must be an object")
            continue
        identifier = item.get("id")
        if not isinstance(identifier, str) or not identifier.strip() or identifier in identifiers:
            errors.append(f"{label} needs a unique, nonempty string ID")
        else:
            identifiers.add(identifier)
        if any(not isinstance(item.get(field), str) or not item[field].strip() for field in ("brand", "model")):
            errors.append(f"{label} needs a brand and model")
        if item.get("status") not in ("available", "sold"):
            errors.append(f"{label} status must be available or sold")
        added = item.get("date_added")
        if added:
            try:
                date.fromisoformat(added)
            except (TypeError, ValueError):
                errors.append(f"{label} date_added must use YYYY-MM-DD")
        image = item.get("image")
        if image:
            if not isinstance(image, str) or not image.startswith("/gear/") or ".." in Path(image).parts:
                errors.append(f"{label} photo must use an absolute /gear/ path")
            elif not (ROOT / image.lstrip("/")).is_file():
                errors.append(f"{label} photo is missing: {image}")


def validate_contact(errors):
    config = json.loads((ROOT / "site-config.json").read_text())
    if not isinstance(config, dict):
        errors.append("site-config.json must contain an object")
        return
    for field in ("email", "phone", "address", "hours"):
        if not isinstance(config.get(field), str):
            errors.append(f"site-config.json {field} must be a string")
    if isinstance(config.get("email"), str) and config["email"] and "@" not in config["email"]:
        errors.append("site-config.json email must be an email address")


def validate_pages(errors):
    for name in PAGES:
        page = ROOT / name
        if not page.is_file():
            errors.append(f"public page is missing: {name}")
            continue
        parser = LocalReferences()
        parser.feed(page.read_text())
        for reference in parser.references:
            parsed = urlparse(reference)
            if parsed.scheme or parsed.netloc or not parsed.path:
                continue
            target = ROOT / unquote(parsed.path).lstrip("/") if parsed.path.startswith("/") else page.parent / unquote(parsed.path)
            if target.is_dir():
                target /= "index.html"
            if not target.is_file():
                errors.append(f"{name} has a missing local reference: {reference}")


def validate_sitemap(errors):
    document = ElementTree.parse(ROOT / "sitemap.xml")
    namespace = {"sitemap": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    locations = {element.text for element in document.findall(".//sitemap:loc", namespace)}
    for name in PAGES:
        expected = "https://www.vintagehifiboise.com/" + ("" if name == "index.html" else name)
        if expected not in locations:
            errors.append(f"sitemap.xml is missing: {expected}")


def main():
    errors = []
    for validator in (validate_inventory, validate_contact, validate_pages, validate_sitemap):
        try:
            validator(errors)
        except (OSError, json.JSONDecodeError, ElementTree.ParseError) as error:
            errors.append(str(error))
    if errors:
        raise SystemExit("Site validation failed:\n- " + "\n- ".join(errors))
    print("Site validation passed.")


if __name__ == "__main__":
    main()
