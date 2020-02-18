const validateOptions = require("schema-utils");
const loaderUtils = require("loader-utils");
const path = require("path");
const schema = {
  type: "object",
  properties: {
    msg: {
      type: "string"
    }
  }
};
module.exports = function(source) {
  const options = loaderUtils.getOptions(this);
  validateOptions(schema, options, "Schema Example");
  console.log(options);
  // 最后一个loader需要这么写
  return `module.exports = ${JSON.stringify(source.substr(0, 10))}`;
};
/* // 返回一个，转换的源代码
module.exports = function(source) {
  // 获取webpack传入的options
  const options = loaderUtils.getOptions(this);
  validateOptions(schema, options, "Example Loader");
  let headerPath = path.resolve(__dirname, "header.js");
  this.addDependency(headerPath);
  return source;
};
// 返回多个，转换的源代码和sourceMap
module.exports = function(source) {
  // 获取webpack传入的options
  const options = loaderUtils.getOptions(this);
  // 相当于异步的return,返回转化后代码和sourceMap
  this.callback(null, source, sourceMaps);
  return;
};

// 异步
module.exports = function(source) {
  let callback = this.async();
  someAsyncOperation(source, function(error, res, sourceMaps, ast) {
    callback(error, res, sourceMaps, ast);
  });
};
// 缓存loader处理结果
// 接收二进制源代码
module.exports = function(source) {
  source instanceof Buffer === true;
  // 缓存loader的处理结果
  if (this.cacheable) {
    this.cacheable(true);
  }
  return source;
};
// 默认是接收字符串，设置true之后，接收二进制数据
module.exports.raw = true;
 */