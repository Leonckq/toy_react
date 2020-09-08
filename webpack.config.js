const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
// const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
module.exports = {
  entry: './main.js',
  mode: 'development',
  optimization: {
    minimize: false
  },
  output: {
    path: path.resolve('dist'),
    filename: 'main.[contentHash:7].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [['@babel/plugin-transform-react-jsx', {pragma: 'createElement'}]]
          }
        }
      }
    ]
  },
  devtool: 'eval-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html'
    }),
    new CleanWebpackPlugin({})
  ],
  
  devServer: {
    // hot: true,
    contentBase: path.join(__dirname, "dist"),
    port: 9966
  },
  resolve: {
    modules: [ path.resolve('node_modules') ],
    extensions: ['.js', '.jsx', '.tsx', '.css', '.json']
  },
}