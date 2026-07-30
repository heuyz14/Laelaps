import { describe, expect, it } from "vitest";

import { createReplaceRedirectHtml } from "@/lib/auth/replace-redirect-response";

describe("createReplaceRedirectHtml", () => {
  it("uses location.replace so successful auth does not keep callback as the immediate history entry", () => {
    const html = createReplaceRedirectHtml("https://laelaps.example/dashboard");

    expect(html).toContain(
      'window.location.replace("https://laelaps.example/dashboard")',
    );
    expect(html).toContain(
      'content="0; url=https://laelaps.example/dashboard"',
    );
  });

  it("escapes noscript fallback attributes", () => {
    const html = createReplaceRedirectHtml(
      'https://laelaps.example/dashboard?next="<bad>"',
    );

    expect(html).toContain(
      'content="0; url=https://laelaps.example/dashboard?next=&quot;&lt;bad&gt;&quot;"',
    );
  });
});
