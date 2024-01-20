export default [{
  entries: ["src/plugin/index.ts"],
  outDir: "dist",
  clean: true,
  declaration: true,
  externals: [
    'vite',
  ],
  rollup: {
    emitCJS: true,
    esbuild: {
      minify: true
    },
    inlineDependencies: true,
  },
}, {
  entries: ["src/client/index.ts"],
  outDir: "dist",
  clean: true,
  declaration: true,
  externals: [
    '@vite-libs/devtools'
  ],
  rollup: {
    emitCJS: true,
    esbuild: {
      minify: true
    },
    inlineDependencies: true,
  },
}]