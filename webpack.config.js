const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const WebpackWatchedGlobEntries = require('webpack-watched-glob-entries-plugin')
const path = require('path')
const term = require('terminal-kit').terminal

const distPath = path.resolve(__dirname, 'dist')

const removeFoldersFromPath = (path) => path.replace(/^.*[\\\/]/, '') // eslint-disable-line

module.exports = (env, argv) => ({
  devtool: argv.mode === 'development' ? 'eval-cheap-source-map' : 'none',
  stats: argv.mode === 'development' ? 'errors-only' : { children: false },
  entry: WebpackWatchedGlobEntries.getEntries(
    [
      path.resolve(__dirname, 'src/views/layout/**/*.js'),
      path.resolve(__dirname, 'src/views/sections/**/*.js')
    ]
  ),
  output: {
    filename: (pathData) => {
      return './assets/' + removeFoldersFromPath(pathData.chunk.name) + '.js'
    },
    path: distPath
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyPlugin([
      // templates
      {
        from: 'src/views/templates/**/*',
        to: 'templates/[name].[ext]',
        ignore: [
          '**/customers/**/*'
        ]
      },
      // templates - customer
      {
        from: 'src/views/templates/customers/**/*',
        to: 'templates/customers/[name].[ext]'
      },
      // sections
      {
        from: 'src/views/sections/**/*.liquid',
        to: 'sections/[name].[ext]'
      },
      // layout
      {
        from: 'src/views/layout/**/*.liquid',
        to: 'layout/[name].[ext]'
      },
      // snippets
      {
        from: 'src/views/snippets/**/*.liquid',
        to: 'snippets/[name].[ext]'
      },
      // config
      {
        from: 'src/config/*',
        to: 'config/[name].[ext]'
      },
      // locales
      {
        from: 'src/locales/*.json',
        to: 'locales/[name].[ext]'
      },
      // assets
      {
        from: 'src/assets/**/*',
        to: 'assets/',
        ignore: ['.DS_Store'],
        flatten: true
      },
      // svgs
      {
        from: 'src/assets/svgs/*.svg',
        to: 'snippets/icon-[name].liquid'
      },
      // shopifyignore
      {
        from: 'src/.shopifyignore'
      }
    ]),
    new MiniCssExtractPlugin({
      filename: (pathData) => {
        return './assets/' + removeFoldersFromPath(pathData.chunk.name) + '.css'
      }
    }),
    function () {
      this.hooks.watchRun.tap('WatchRun', (comp) => {
        const changedTimes = comp.watchFileSystem.watcher.mtimes
        const changedFiles = Object.keys(changedTimes)
          .map(file => `\n  ${file}`)
          .join('')
        if (changedFiles.length) {
          console.clear()
          term.green('\nWatching for changes...\n')
        }
      })
    },
    function () {
      let isFirstCompile = true
      let isFirstDone = true
      let isWatching = false

      this.hooks.watchRun.tapAsync('watchRun', (stats, callback) => {
        isWatching = true
        callback()
      })

      this.hooks.beforeCompile.tapAsync('beforeCompile', (stats, callback) => {
        if (isFirstCompile) {
          term.green('\nBuilding theme... \n')
          isFirstCompile = false
        }
        callback()
      })

      this.hooks.done.tapAsync('done', (stats, callback) => {
        if (isFirstDone) {
          if (stats.compilation.errors.length > 0) {
            console.log(stats.compilation.errors)
            process.exit(1)
          }

          const outputCommand = (command, description) => {
            term.cyan(`\n\`${command}\`: `)
            term.white(description)
          }

          if (isWatching) {
            term.cyan('\n==================================================')
            outputCommand('yarn serve', 'Launch dev theme preview')
            outputCommand('yarn push', 'Build and push to pre-exisiting theme')
            outputCommand('yarn push-new', 'Build and push to new theme')
            outputCommand('yarn sync', 'Pull down settings from a theme')
            outputCommand('shopify login', 'Authenticates you with Shopify CLI')
            outputCommand('shopify switch', 'Switch between stores without logging in/out')
            term.cyan('\n==================================================')

            term.green('\n\nTheme built successfully! Ensure you are logged into the correct store above. \nThen run')
            term.cyan(' yarn serve ')
            term.green('from a new terminal')
            term.green('\n\nWatching for changes...')
          }

          isFirstDone = false
        }
        callback()
      })
    }
  ],
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@scripts': path.resolve(__dirname, 'src/scripts'),
      '@views': path.resolve(__dirname, 'src/views'),
      '@sections': path.resolve(__dirname, 'src/views/sections'),
      '@snippets': path.resolve(__dirname, 'src/views/snippets'),
      '@templates': path.resolve(__dirname, 'src/views/templates')
    },
    extensions: ['.ts', '.tsx', '.js', '.scss']
  },
  watchOptions: {
    poll: true,
    ignored: ['**/dist', '**/node_modules']
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['@babel/env']
        }
      },
      {
        test: /\.(sc|sa|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
              sourceMap: true
            }
          },
          'postcss-loader',
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true
            }
          }
        ]
      }
    ]
  }
})
