# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-05-02

### Added

- Initial release.
- `markdownAlternate()` Astro integration that injects `<link rel="alternate" type="text/markdown">` at build time.
- File-existence check: pages without a corresponding `.md` file in the output directory are silently skipped.
- `test` and `href` options for customising which pages are processed and how the markdown URL is derived.
