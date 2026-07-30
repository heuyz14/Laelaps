import { NextResponse } from "next/server";

export function createReplaceRedirectResponse(destination: string) {
  return new NextResponse(createReplaceRedirectHtml(destination), {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

export function createReplaceRedirectHtml(destination: string) {
  const safeDestination = JSON.stringify(destination);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>Redirecting...</title>
  </head>
  <body>
    <script>
      window.location.replace(${safeDestination});
    </script>
    <noscript>
      <meta http-equiv="refresh" content="0; url=${escapeHtmlAttribute(destination)}" />
      <a href="${escapeHtmlAttribute(destination)}">Continue</a>
    </noscript>
  </body>
</html>`;
}

function escapeHtmlAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
