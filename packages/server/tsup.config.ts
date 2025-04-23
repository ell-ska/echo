import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'api',
  format: ['esm'],
  target: 'node18',
  splitting: false,
  clean: true,
  shims: true,
  dts: false,
})
