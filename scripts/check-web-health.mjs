#!/usr/bin/env node

const baseUrl = process.argv[2] ?? process.env.LAELAPS_WEB_URL ?? "http://localhost:3000";

async function request(url) {
  try {
    return await fetch(url, { redirect: "manual" });
  } catch (error) {
    throw new Error(`Unable to reach ${url}: ${error.message}`);
  }
}

function collectAssetUrls(html, origin) {
  const urls = new Set();
  const patterns = [
    /<link[^>]+href=["']([^"']+\.css(?:\?[^"']*)?)["'][^>]*>/gi,
    /<script[^>]+src=["']([^"']+\.js(?:\?[^"']*)?)["'][^>]*>/gi,
  ];

  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      urls.add(new URL(match[1], origin).toString());
    }
  }

  return [...urls];
}

const pageResponse = await request(baseUrl);
if (!pageResponse.ok) {
  throw new Error(`Page health check failed: ${baseUrl} returned ${pageResponse.status}`);
}

const html = await pageResponse.text();
const assetUrls = collectAssetUrls(html, baseUrl);

if (assetUrls.length === 0) {
  throw new Error("Page loaded, but no CSS or JS asset URLs were found in the HTML.");
}

const failures = [];
for (const assetUrl of assetUrls) {
  const response = await request(assetUrl);
  if (!response.ok) {
    failures.push(`${response.status} ${assetUrl}`);
  }
}

if (failures.length > 0) {
  throw new Error(`Asset health check failed:\n${failures.join("\n")}`);
}

console.log(`Web health check passed for ${baseUrl}`);
console.log(`Verified ${assetUrls.length} CSS/JS asset(s).`);
