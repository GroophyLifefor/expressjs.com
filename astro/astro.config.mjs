// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import icon from 'astro-icon';
import remarkRewriteLocalizedLinks from './src/utils/remark/rewrite-localized-links.mjs';

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), icon()],
  markdown: {
    remarkPlugins: [[remarkRewriteLocalizedLinks, { prefixes: ['guide', 'starter', 'api'] }]],
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
