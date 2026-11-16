import { defineConfig } from 'vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cp, readFile, readdir, writeFile } from 'node:fs/promises';

const pages = ['index', 'tires', 'services', 'promotions', 'book', 'contact', 'privacy'];
const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  // Relative URLs keep assets and built bundles working on GitHub Pages
  // repository subpaths as well as at a domain root.
  base: './',
  build: {
    rollupOptions: {
      input: Object.fromEntries(pages.map((page) => [page, resolve(rootDir, `${page}.html`)])),
    },
  },
  plugins: [{
    name: 'prerender-existing-page-content',
    apply: 'build',
    async closeBundle() {
      const outputDir = resolve(rootDir, 'dist');
      await cp(resolve(rootDir, 'assets'), resolve(outputDir, 'assets'), { recursive: true });
      await cp(resolve(rootDir, '.nojekyll'), resolve(outputDir, '.nojekyll'));
      const rootFiles = await readdir(rootDir);
      await Promise.all(rootFiles.filter((file) => /\.(?:webp|png|jpe?g|svg|woff2?)$/i.test(file)).map((file) => cp(resolve(rootDir, file), resolve(outputDir, file))));
      const pagesWithIds = {
        index: 'hp', tires: 'tp', services: 'sv', promotions: 'pr',
        book: 'bk', contact: 'ct', privacy: 'pv',
      };
      await Promise.all(Object.entries(pagesWithIds).map(async ([page, id]) => {
        const [html, content] = await Promise.all([
          readFile(resolve(outputDir, `${page}.html`), 'utf8'),
          readFile(resolve(rootDir, 'src', 'pages', `${page}.html`), 'utf8'),
        ]);
        const rendered = `<div id="react-root"><div id="site-header"></div><main id="${id}" data-page-root>${content}</main><div id="site-footer"></div></div>`;
        await writeFile(resolve(outputDir, `${page}.html`), html.replace('<div id="react-root"></div>', rendered));
      }));
    },
  }],
});
