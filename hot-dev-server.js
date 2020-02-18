const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server");
const config = require("./webpack.config");

const compiler = webpack(config);

let server = new webpackDevServer(compiler, config.devServer);

server.listen(config.devServer.port, "localhost", err => {
  if (err) {
    console.error(err);
  }
});
