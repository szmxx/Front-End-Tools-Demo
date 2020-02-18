class HelloPlugin {
  apply(compiler) {
    // emit钩子是生成资源到output之前触发
    // https://webpack.docschina.org/api/compiler-hooks/
    compiler.hooks.emit.tapAsync("HelloPlugin", (compilation, callback) => {
      console.log("hello world");
      // compilation.addModule();
      callback();
    });
  }
}
module.exports = HelloPlugin;
