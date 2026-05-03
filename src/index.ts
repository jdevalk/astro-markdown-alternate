import type { AstroIntegration } from 'astro';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface MarkdownAlternateOptions {
    /** Return true if this page should get a markdown alternate link.
     *  Default: every page. */
    test?: (pathname: string, html: string) => boolean;
    /** Generate the markdown href from the page pathname.
     *  Return null to skip the page. Default: strip trailing slash, append .md. */
    href?: (pathname: string) => string | null;
    /**
     * Append X-Markdown-Tokens headers to _headers (Cloudflare Pages / Netlify).
     * The value is an estimated token count: byte length of the markdown file divided by 4.
     * Has no effect on platforms that ignore _headers (Vercel, S3, GitHub Pages).
     * Default: true.
     */
    tokenHeader?: boolean;
}

function defaultTest(_pathname: string, _html: string): boolean {
    return true;
}

function defaultHref(pathname: string): string | null {
    const slug = pathname.replace(/^\/|\/$/g, '');
    return slug ? `/${slug}.md` : null;
}

export function markdownAlternate(options: MarkdownAlternateOptions = {}): AstroIntegration {
    const test = options.test ?? defaultTest;
    const href = options.href ?? defaultHref;
    const tokenHeader = options.tokenHeader !== false;

    return {
        name: 'astro-markdown-alternate',
        hooks: {
            'astro:build:done': async ({ dir }) => {
                const distPath = fileURLToPath(dir);
                const base = distPath.endsWith('/') ? distPath : distPath + '/';
                const headerEntries: string[] = [];

                async function walk(dirPath: string): Promise<void> {
                    const entries = await readdir(dirPath, { withFileTypes: true });
                    await Promise.all(
                        entries.map(async (entry) => {
                            const fullPath = join(dirPath, entry.name);
                            if (entry.isDirectory()) {
                                await walk(fullPath);
                                return;
                            }
                            if (entry.name !== 'index.html') return;
                            const pathname = '/' + fullPath.slice(base.length).replace('index.html', '');
                            const html = await readFile(fullPath, 'utf-8');
                            if (!test(pathname, html)) return;
                            const markdownHref = href(pathname);
                            if (!markdownHref) return;
                            const mdFilePath = join(base, markdownHref);
                            let mdContent: string;
                            try {
                                mdContent = await readFile(mdFilePath, 'utf-8');
                            } catch {
                                return;
                            }
                            if (tokenHeader && markdownHref.startsWith('/')) {
                                const tokens = Math.ceil(Buffer.byteLength(mdContent, 'utf8') / 4);
                                headerEntries.push(`${markdownHref}\n  X-Markdown-Tokens: ${tokens}`);
                            }
                            const link = `<link rel="alternate" type="text/markdown" href="${markdownHref}">`;
                            await writeFile(fullPath, html.replace('</head>', `${link}\n</head>`));
                        }),
                    );
                }

                await walk(base);

                if (tokenHeader && headerEntries.length > 0) {
                    const headersPath = join(base, '_headers');
                    let existing = '';
                    try {
                        existing = await readFile(headersPath, 'utf-8');
                    } catch {
                        // no existing _headers file
                    }
                    const separator = existing && !existing.endsWith('\n') ? '\n' : '';
                    await writeFile(headersPath, existing + separator + headerEntries.join('\n') + '\n');
                }
            },
        },
    };
}
