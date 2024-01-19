import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/plugin',
  ],
  clean: true,
  declaration: true,
  externals: [
    'vite'
  ],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
})