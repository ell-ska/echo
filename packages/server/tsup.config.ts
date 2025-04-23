import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist/api',
  format: ['esm'],
  target: 'node18',
  splitting: false,
  clean: true,
  shims: true,
  dts: false,
})
