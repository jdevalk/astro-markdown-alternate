# Contributing

## Development setup

```bash
git clone https://github.com/jdevalk/astro-markdown-alternate.git
cd astro-markdown-alternate
npm install
```

## Build and typecheck

```bash
npm run build       # compile TypeScript to dist/
npm run typecheck   # type-check without emitting
```

Always run both before submitting a PR.

## Pull request process

1. Fork the repo and create a branch from `main`.
2. Make your changes; keep commits focused and atomic.
3. Run `npm run build && npm run typecheck` and confirm both pass.
4. Open a PR against `main`. Describe what changed and why.
5. PRs that change behaviour should include a short note on how to test the change manually.

## Reporting issues

Use [GitHub Issues](https://github.com/jdevalk/astro-markdown-alternate/issues). For security issues, see [SECURITY.md](SECURITY.md).
