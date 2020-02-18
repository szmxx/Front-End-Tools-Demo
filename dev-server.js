const webpack = require("webpack");
const express = require("express");
const config = require("./webpack.config");
const webpackMiddleware = require("webpack-dev-middleware");
// 使用express然后进行热替换很麻烦
const compiler = webpack(config);

let devWebpack = webpackMiddleware(compiler, {
  publicPath: config.output.publicPath,
  stats: {
    colors: true,
    chunks: false
  }
});

const server = new express();

server.use(devWebpack);

server.listen(config.devServer.port, "0.0.0.0", err => {
  if (err) {
    console.error(err);
  }
});
