const chokidar = require('chokidar')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const fs = require('fs')
const glob = require('glob')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const path = require('path')
const shell = require('shelljs')
const term = require('terminal-kit').terminal
const YAML = require('yaml')
const _ = require('lodash')

const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production'
const devMode = mode === 'development'

const devtool = devMode ? 'eval-cheap-source-map' : 'none'
const stats = devMode ? 'errors-warnings' : { children: false }

const port = 9000
const publicPath = `https://localhost:${port}/`

const pathConfig = path.resolve(__dirname, 'config.yml')
const pathSprite = path.resolve(__dirname, './devops/sprites/sprites.js')

const entriesWithPathNames = (globPath) =>
  glob.sync(globPath).reduce((entries, pathName) => {
    const fileName = pathName.replace(/^.*[\\\/]/, '').replace('.js', ''); // eslint-disable-line
    entries[fileName] = pathName

    return entries
  }, {})

module.exports = {
  mode,
  devtool,
  entry: {
    ...entriesWithPathNames('./src/views/layout/**/*.js'),
    ...entriesWithPathNames('./src/views/templates/**/*.js')
  },
  output: {
    filename: './assets/[name].js',
    path: path.resolve(__dirname, 'dist'),
    publicPath
  },
  plugins: [
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new CopyPlugin([
      // templates
      {
        from: 'src/views/templates/**/*.liquid',
        to: 'templates/[name].[ext]',
        ignore: [
          '**/customers/**/*'
        ]
      },
      // templates - customer
      {
        from: 'src/views/templates/customers/**/*.liquid',
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
        to: 'snippets/[name].[ext]',
        // inject template csv into script & style tags snippet for dynamic imports
        transform (content, filePath) {
          if (filePath.includes('script-tags') || filePath.includes('style-tags')) {
            const customTemplates = []
            const extension = filePath.includes('script-tags') ? '.js' : '.scss';

            [
              `./src/views/templates/**/*${extension}`
            ].forEach(globPath => {
              glob.sync(globPath).forEach((pathName) => {
                const fileName = pathName.split('/templates/')[1].split('/')[1].replace(extension, '')
                customTemplates.push(fileName)
              })
            })

            return content
              .toString()
              .replace('WEBPACK_ENVIRONMENT', mode)
              .replace('WEBPACK_PUBLIC_PATH', publicPath)
              .replace('WEBPACK_CUSTOM_TEMPLATES', customTemplates.toString())
          } else {
            return content
          }
        }
      },
      // config
      {
        from: 'src/config/*',
        to: 'config/[name].[ext]'
      },
      // locals
      {
        from: 'src/locales/*.json',
        to: 'locales/[name].[ext]'
      },
      // assets
      {
        from: 'src/assets/**/*',
        to: 'assets/',
        globOptions: {
          ignore: ['.DS_Store', '**/sprites/**/*']
        },
        flatten: true
      },
      // svgs
      {
        from: 'src/assets/svgs/*.svg',
        to: 'snippets/icon-[name].liquid'
      }
    ])
  ],
  stats,
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
    ignored: /node_modules/
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
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
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
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    publicPath: '/',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
    },
    compress: true,
    port,
    https: true,
    disableHostCheck: true,
    historyApiFallback: true,
    hot: true,
    overlay: true,
    writeToDisk: true,
    after (app, server) {
      chokidar.watch(['./**/*.liquid'], {
        ignoreInitial: true
      })
        .on('all', () => setTimeout(() => {
          server.sockWrite(server.sockets, 'content-changed')
        }, 4500))

      chokidar.watch(['./src/assets/sprites/**/*'], {
        ignoreInitial: true,
        awaitWriteFinish: true
      })
        .on('all', _.debounce(() => {
          shell.exec(`node ${pathSprite}`)
        }, 3000))
    }
  }
}

if (!devMode) {
  module.exports.plugins.push(
    new MiniCssExtractPlugin({
      filename: './assets/[name].css.liquid'
    })
  )
}

const echoThemeUrl = ({ theme_id: themeID, store }) => {
  if (!themeID || !store) return

  term.cyan('===================================================================\n')
  term.cyan(`https://${store}/?preview_theme=${themeID}\n`)
  term.cyan('===================================================================\n\n')
}

if (devMode) {
  module.exports.plugins.push(
    function () {
      let isFirstRun = true

      // Get environments from config.yml
      const file = fs.readFileSync(pathConfig, 'utf8')

      const themekitConfig = YAML.parse(file)
      const devEnv = themekitConfig?.development

      this.hooks.done.tapAsync('done', (stats, callback) => {
        if (isFirstRun) {
          if (stats.compilation.errors.length > 0) {
            console.log(stats.compilation.errors)
            process.exit(1)
          }

          term.green('\nTheme built successfully. \n\n')

          // generate sprites
          shell.exec(`node ${pathSprite}`)

          // deploy
          term.green('Deploying')
          term.cyan(' `development`')
          term.green(' environment on initial build....\n\n')
          shell.exec('shopify-themekit deploy --env=development')

          // show insecure helper
          term.green('\nTheme deployed! Watching for changes... \n\n')
          term.green('You should allow invalid certificates in chrome to load HTTPS assets by visiting:\n')
          term.cyan('chrome://flags/#allow-insecure-localhost\n\n')

          // start watch and open theme
          shell.exec('shopify-themekit open --env=development', { async: true })
          shell.exec('shopify-themekit watch --env=development', { async: true })

          echoThemeUrl(devEnv)

          isFirstRun = false
        }
        callback()
      })
    }
  )
}
