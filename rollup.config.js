// Rollup plugins
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
const packageJson = require('./package.json')
const isDev = process.env.NODE_ENV !== 'production'

export default {
  entry: 'src/crop/index.js',
  banner: `
  /*!
   * @name xcrop v${packageJson.version}
   * @github https://github.com/ffx0s/xcrop
   * @license MIT.
   */
  `,
  dest: isDev ? 'dist/crop.js' : 'dist/crop.min.js',
  format: 'umd',
  moduleName: 'Crop',
  plugins: [
    resolve({
      jsnext: true,
      main: true,
      browser: true
    }),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    }),
    replace({
      exclude: 'node_modules/**',
      ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    (!isDev && uglify({
      output: {
        comments (node, comment) {
          const text = comment.value
          const type = comment.type
          if (type === 'comment2') {
            // multiline comment
            return /@name|@github|@license/i.test(text)
          }
        }
      }
    }))
  ]
}
