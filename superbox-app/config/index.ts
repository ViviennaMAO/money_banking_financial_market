import path from 'path'
import { defineConfig } from '@tarojs/cli'

export default defineConfig(async (merge, { command, mode }) => {
  const baseConfig = {
    projectName: 'mishkin-superbox',
    date: '2026-5-1',
    designWidth: 750,
    deviceRatio: { 640: 2.34 / 2, 750: 1, 828: 1.81 / 2 },
    sourceRoot: 'src',
    outputRoot: 'dist',
    plugins: [],
    defineConstants: {},
    copy: { patterns: [], options: {} },
    framework: 'react' as const,
    compiler: { type: 'webpack5' as const, prebundle: { enable: false } },
    cache: { enable: false },
    alias: {
      '@/*': path.resolve(__dirname, '..', 'src'),
    },
    mini: {
      postcss: {
        pxtransform: { enable: true, config: {} },
        cssModules: { enable: false }
      }
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',
      output: { filename: 'js/[name].[hash:8].js', chunkFilename: 'js/[name].[chunkhash:8].js' },
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css'
      },
      postcss: {
        autoprefixer: { enable: true, config: {} },
        cssModules: { enable: false }
      }
    }
  }

  if (process.env.NODE_ENV === 'development') {
    return merge({}, baseConfig, { mini: { debugReact: true } })
  }
  return merge({}, baseConfig, { mini: { optimizeMainPackage: { enable: true } } })
})
