// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  fonts: [
    {
      name: 'Geist',
      cssVariable: '--font-geist-sans',
      provider: fontProviders.google(),
      weights: [400, 500, 600],
      styles: ['normal'],
    },
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});