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
})
```

## Content negotiation with Cloudflare

The `<link rel="alternate">` tag lets clients discover the markdown URL. Clients that send `Accept: text/markdown` can also receive the `.md` file directly via a Cloudflare Transform Rule — no server-side code needed.

### Create the rule

In the Cloudflare dashboard, go to **Rules → Transform Rules → URL Rewrite**, create a new rule, and configure it as follows:

**When incoming requests match:**

Use a custom filter expression:

```
any(http.request.headers["accept"][*] contains "text/markdown")
```

**Then rewrite the URL — Path → Dynamic:**

```
concat(regex_replace(http.request.uri.path, "/$", ""), ".md")
```

This strips any trailing slash from the path and appends `.md`, so a request for `/my-post/` with `Accept: text/markdown` is rewritten to serve `/my-post.md`.

The rule only fires when the `Accept` header actually contains `text/markdown`, so normal browser traffic is unaffected.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
