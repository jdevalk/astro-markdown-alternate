# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] — 2026-05-03

### Added

- `X-Markdown-Tokens` header support: after the build, a `_headers` file is written (or appended to) with an estimated token count for each markdown file (byte length ÷ 4). Works on Cloudflare Pages and Netlify; silently ignored on other platforms.
- `tokenHeader` option (`boolean`, default `true`) to opt out of `_headers` generation.

## [0.1.0] — 2026-05-02

### Added

- Initial release.
- `markdownAlternate()` Astro integration that injects `<link rel="alternate" type="text/markdown">` at build time.
- File-existence check: pages without a corresponding `.md` file in the output directory are silently skipped.
- `test` and `href` options for customising which pages are processed and how the markdown URL is derived.
