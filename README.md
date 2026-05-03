# @jdevalk/astro-markdown-alternate

[![CI](https://github.com/jdevalk/astro-markdown-alternate/actions/workflows/ci.yml/badge.svg)](https://github.com/jdevalk/astro-markdown-alternate/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@jdevalk/astro-markdown-alternate.svg)](https://www.npmjs.com/package/@jdevalk/astro-markdown-alternate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

This Astro integration makes the markdown source of each page discoverable via `<link rel="alternate" type="text/markdown">`, so AI agents and HTTP clients can fetch raw content directly. Read more on [joost.blog/markdown-alternate/](https://joost.blog/markdown-alternate/).

## Installation

```bash
npm install @jdevalk/astro-markdown-alternate
```

## Usage

```js
// astro.config.mjs
import { markdownAlternate } from '@jdevalk/astro-markdown-alternate';

export default defineConfig({
    integrations: [markdownAlternate()],
});
```

For every built page that has a corresponding `.md` file in the output directory, the integration appends to `<head>`:

```html
<link rel="alternate" type="text/markdown" href="/your-post.md">
```

Pages without a matching `.md` file are silently skipped, so no broken alternate links are ever emitted. See [createMarkdownEndpoint](https://github.com/jdevalk/seo-graph) for a ready-made route factory that generates those `.md` files.

## X-Markdown-Tokens header

For each processed page, the integration also appends an entry to `_headers` in the output directory:

```
/your-post.md
  X-Markdown-Tokens: 312
```

The value is an estimated token count — byte length of the markdown file divided by 4, matching Cloudflare's approach. This lets AI agents check context-window cost before fetching the full content.

`_headers` is supported by **Cloudflare Pages** and **Netlify**. On other platforms the file is silently ignored. If you already have a `_headers` file, entries are appended rather than overwriting it.

## Options

```ts
markdownAlternate({
    // Override which pages are candidates for a link.
    // Default: all pages (the .md existence check always runs regardless).
    test(pathname, html) {
        return html.includes('"article"');
    },

    // Override the href value.
    // Default: strip trailing slash and append .md.
    href(pathname) {
        const slug = pathname.replace(/^\/|\/$/g, '');
        return slug ? `/${slug}.md` : null;
    },

    // Set to false to skip writing X-Markdown-Tokens entries to _headers.
    // Default: true.
    tokenHeader: false,
})
```

## Content negotiation with Cloudflare

The `<link rel="alternate">` tag lets clients discover the markdown URL. Clients that send `Accept: text/markdown` can also receive the `.md` file directly via Cloudflare Transform Rules — no server-side code needed.

### Create two rules

In the Cloudflare dashboard, go to **Rules → Transform Rules → URL Rewrite**.

**Rule 1 — all paths except root**

Filter expression:

```
http.request.headers["accept"][0] contains "text/markdown" and http.request.uri.path ne "/"
```

Path → Dynamic:

```
wildcard_replace(http.request.uri.path, "*/", "${1}.md")
```

This rewrites `/my-post/` → `/my-post.md` for any request with `Accept: text/markdown`.

**Rule 2 — root path**

Filter expression:

```
http.request.headers["accept"][0] contains "text/markdown" and http.request.uri.path eq "/"
```

Path → Static: `/index.md`

You'll need a static `/index.md` endpoint in your Astro site for this to resolve. A minimal one:

```ts
// src/pages/index.md.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const GET: APIRoute = async () => {
    const posts = await getCollection('blog', ({ data }) => !data.draft);
    const sorted = posts.sort((a, b) =>
        new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
    );
    const body = [
        '# My Site',
        '',
        '## Recent articles',
        '',
        ...sorted.slice(0, 10).map(p => `- [${p.data.title}](/${p.id}/)`),
    ].join('\n');
    return new Response(body, {
        headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
};
```

Both rules only fire when the `Accept` header contains `text/markdown`, so normal browser traffic is unaffected.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
