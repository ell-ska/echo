import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['api/index.ts'],
  outDir: 'dist',
  format: ['esm'],
  target: 'node18',
  splitting: false,
  clean: true,
  shims: true,
  dts: false,
})
