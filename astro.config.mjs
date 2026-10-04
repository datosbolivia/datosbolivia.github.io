import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localSdkSrc = path.resolve(__dirname, '../datamesh-sdk/bindings/typescript/src/index.ts');
const isDev = process.env.NODE_ENV !== 'production' && !process.argv.includes('build');
const shouldUseLocalSdk = isDev && fs.existsSync(localSdkSrc);

export default defineConfig({
  output: 'static',
  site: 'https://datos-bolivia.github.io',
  base: '/',
  build: {
    format: 'file'
  },
  vite: {
    resolve: {
      alias: shouldUseLocalSdk ? {
        '@datosbolivia/datamesh-client': localSdkSrc,
      } : {},
    },
    optimizeDeps: {
      exclude: ['@datosbolivia/datamesh-client'],
    },
  },
});
