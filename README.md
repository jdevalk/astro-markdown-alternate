# @jdevalk/astro-markdown-alternate

Astro integration that injects `<link rel="alternate" type="text/markdown">` into article pages at build time, allowing AI agents and other clients to discover the markdown version of each page.

Described in [joost.blog/markdown-alternate/](https://joost.blog/markdown-alternate/).

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

For every built HTML page whose `<head>` contains `og:type="article"`, the integration appends:

```html
<link rel="alternate" type="text/markdown" href="/your-post.md">
```

This assumes you have `.md` endpoints at `/{slug}.md`. See [createMarkdownEndpoint](https://github.com/jdevalk/seo-graph) for a ready-made route factory.

## Options

```ts
markdownAlternate({
    // Override which pages get the link.
    // Default: pages whose HTML contains og:type="article".
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

## License

MIT
