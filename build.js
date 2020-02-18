const webpack = require("webpack");
const config = require("./webpack.config");

webpack(config, (err, state) => {
  // webpack 配置错误
  if (err) {
    console.error(err || err.stack);
    if (err.details) {
      console.log(err.details);
    }
    return;
  }
  // webpack 编译错误，比如模块和语法错误
  if (state.hasErrors()) {
    console.error(state.toJson().errors);
    process.exit(1);
  }
  if (state.hasWarnings()) {
    console.warn(state.toJson().warnings);
  }
});
