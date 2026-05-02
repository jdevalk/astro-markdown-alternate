import type { AstroIntegration } from 'astro';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface MarkdownAlternateOptions {
    /** Return true if this page should get a markdown alternate link.
     *  Default: any page whose HTML contains og:type="article". */
    test?: (pathname: string, html: string) => boolean;
    /** Generate the markdown href from the page pathname.
     *  Return null to skip the page. Default: strip trailing slash, append .md. */
    href?: (pathname: string) => string | null;
}

function defaultTest(_pathname: string, html: string): boolean {
    return html.includes('og:type') && html.includes('"article"');
}

function defaultHref(pathname: string): string | null {
    const slug = pathname.replace(/^\/|\/$/g, '');
    return slug ? `/${slug}.md` : null;
}

export function markdownAlternate(options: MarkdownAlternateOptions = {}): AstroIntegration {
    const test = options.test ?? defaultTest;
    const href = options.href ?? defaultHref;

    return {
        name: 'astro-markdown-alternate',
        hooks: {
            'astro:build:done': async ({ dir }) => {
                const distPath = fileURLToPath(dir);
                const base = distPath.endsWith('/') ? distPath : distPath + '/';

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
                            const link = `<link rel="alternate" type="text/markdown" href="${markdownHref}">`;
                            await writeFile(fullPath, html.replace('</head>', `${link}\n</head>`));
                        }),
                    );
                }

                await walk(base);
            },
        },
    };
}
