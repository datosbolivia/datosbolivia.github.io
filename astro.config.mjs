import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://datos-bolivia.github.io',
  base: '/',
  build: {
    format: 'file'
  }
});
