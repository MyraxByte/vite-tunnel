import { BuildConfig } from "unbuild"

export default [{
  entries: ["src/plugin.ts"],
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
}] as BuildConfig[]