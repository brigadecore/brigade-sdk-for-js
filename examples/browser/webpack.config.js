const { SourceMap } = require("module")
const path = require("path")
const webpack = require("webpack")

module.exports = {
  mode: "development",
  entry: "./dist/index.js",
  node: {
    global: true,
    __filename: false,
    __dirname: false
  },
  resolve: {
    fallback: {
      events: require.resolve("events/"),
      http: false,
      https: false,
      process: false,
      url: false,
      util: false
    }
  },
  plugins: [
    // fix "process is not defined" error:
    // (do "npm install process" before running the build)
    new webpack.ProvidePlugin({
      process: "process/browser"
    })
  ],
  output: {
    libraryTarget: "umd",
    filename: "index.webpacked.js",
    path: path.resolve(__dirname, "dist")
  },
  experiments: {
    topLevelAwait: true
  }
}
