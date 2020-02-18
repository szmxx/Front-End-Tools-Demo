const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 打包分析插件
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
  .BundleAnalyzerPlugin;
// 清除dist文件夹
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
// 访问内置的插件
const webpack = require("webpack");
// 自定义插件
const HelloPlugin = require("./plugins/webpack-plugin");
module.exports = {
  // 该配置文件所有相对路径基于这个(除publicPath)
  context: path.resolve(__dirname, "src", "app"),
  // 启用相应模式下的webpack内置优化
  mode: "development",
  entry: {
    main: "./main.js"
  },
  output: {
    // 输入文件目录路径
    path: path.resolve(__dirname, "dist"),
    // [name] [hash:8] [ext] [id]
    filename: "[name].[hash].bundle.js",
    chunkFilename: "[id].js",
    // 对于按需加载(on-demand-load)或加载外部资源(external resources)（如图片、文件等）来说，
    // output.publicPath 是很重要的选项。如果指定了一个错误的值，则在加载这些资源时会收到 404 错误
    // 此选项的值都会以 / 结束
    // 静态资源最终访问路径 = output.publicPath + 资源图片等配置路径
    publicPath: "./"
  },
  // 影响构建生成速度和生成sourceMap品质
  // https://webpack.docschina.org/configuration/devtool/#devtool
  devtool: "cheap-module-eval-source-map",
  devServer: {
    // 托管文件路径
    contentBase: "./dist",
    port: 3007,
    hot: true,
    open: true
  },
  // 配置模块怎么解析
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src")
    },
    // 自动解析确定的扩展，意味着会覆盖默认的配置，设置后导入模块不需要写扩展名
    extensions: [".js", ".vue", ".css", ".less", ".sass", ".json"],
    // 解析模块时应该搜索的目录，从左往右
    modules: [path.resolve(__dirname, "node_modules")]
  },
  // 在指定目录寻找loader
  resolveLoader: {
    modules: ["node_modules", path.resolve(__dirname, "loaders")]
  },
  module: {
    // loader是一个导出为一个函数的node模块，该函数在转换资源时被调用，给定的函数将调用Loader API，并通过this访问
    // loader输入文件的内容，输出loader处理后的文件和一个sourceMap
    rules: [
      {
        test: /\.txt$/,
        use: [
          {
            loader: "loader",
            options: {
              name: "success"
            }
          }
        ]
      },
      {
        test: /\.js$/,
        use: "babel-loader",
        // 可以改变loader执行顺序
        // pre:权重最高，normal:权重第二，inline:权重第三，post:权重第四
        // inline模式是指这种：!style-loader!css-loader?modules!./style.css
        // 可以在导入时就使用loader对文件进行处理
        // 执行从右往左执行，前缀除了！还有！！和-！
        // https://webpack.js.org/concepts/loaders/
        enforce: "pre"
      },
      {
        test: /\.css$/,
        // 从右往左，从下往上执行，但是会从左往右调用patch方法，然后从右往左调用normal方法
        use: [
          {
            loader: "style-loader"
          },
          {
            loader: "css-loader",
            options: {
              modules: true
            }
          }
        ]
      },
      {
        test: /\.png$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "url-loader",
            options: {
              // 小于4096kb作为base64进行处理
              limit: 4096,
              fallback: {
                loader: "file-loader",
                options: {
                  name: "img/[name].[hash:8].[ext]"
                }
              }
            }
          }
        ]
      }
    ]
  },
  plugins: [
    new HelloPlugin(),
    new HtmlWebpackPlugin({
      template: "./index.html"
    }),
    // shimming，可以在整个应用程序使用_，而不需要引入，如果没有引入就不会使用lodash模块
    new webpack.ProvidePlugin({
      _: "lodash"
    }),
    new BundleAnalyzerPlugin(),
    new CleanWebpackPlugin()
    // 这个对于使用webpack-dev-server来热更换没有什么作用
    // new webpack.HotModuleReplacementPlugin()
  ]
};
