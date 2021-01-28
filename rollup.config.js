import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import { uglify } from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import postcss from 'rollup-plugin-postcss'
import simplevars from 'postcss-simple-vars'
import nested from 'postcss-nested'
import cssnext from 'postcss-cssnext'
import cssnano from 'cssnano'

const packageJson = require('./package.json')
const isDev = process.env.NODE_ENV !== 'production'

export default {
  input: 'src/crop/index.js',
  output: {
    file: isDev ? 'dist/crop.js' : 'dist/crop.min.js',
    banner: `
    /*!
     * @name xcrop v${packageJson.version}
     * @github https://github.com/ffx0s/xcrop
     * @license MIT.
     */
    `,
    format: 'umd',
    name: 'Crop',
    intro: 'var win = window; var Math = win.Math;'
  },
  plugins: [
    postcss({
      plugins: [
        simplevars(),
        nested(),
        cssnext({ warnForDuplicates: false }),
        cssnano()
      ],
      extensions: ['.css']
    }),
    resolve({
      browser: true
    }),
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
