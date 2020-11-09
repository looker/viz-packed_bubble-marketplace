var path = require("path");

const UglifyJSPlugin = require("uglifyjs-webpack-plugin");

var webpackConfig = {
  mode: "production",
  entry: {
    packed_bubble: "./src/bubble_chart/bubble_chart_container.js",
  },
  devServer: {
    contentBase: "./dist",
  },
  output: {
    filename: "[name].js",
    path: __dirname,
    library: "[name]",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".js"],
    modules: [path.join(__dirname, "../src"), "node_modules"],
  },
  plugins: [new UglifyJSPlugin()],
  module: {
    rules: [
      { test: /\.(js|jsx)$/, use: "babel-loader" },
      { test: /\.css$/, loader: ["to-string-loader", "css-loader"] },
      { test: /\.(woff|woff2|ttf|otf)$/, loader: "url-loader" },
    ],
  },
  stats: {},
};

module.exports = webpackConfig;
