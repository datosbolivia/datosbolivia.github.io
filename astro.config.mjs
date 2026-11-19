import { defineConfig } from 'astro/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localSdkDist = path.resolve(__dirname, '../datamesh-sdk/bindings/typescript/dist/index.js');
const shouldUseLocalSdk = fs.existsSync(localSdkDist);

export default defineConfig({
  output: 'static',
  site: 'https://datos-bolivia.github.io',
  base: '/',
  build: {
    format: 'file'
  },
  vite: {
    resolve: {
      preserveSymlinks: true,
      alias: shouldUseLocalSdk ? {
        '@datosbolivia/datamesh-client': localSdkDist,
      } : {},
    },
    optimizeDeps: {
      exclude: ['@datosbolivia/datamesh-client'],
    },
  },
});
