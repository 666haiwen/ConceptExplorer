const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');

module.exports = {
  entry: ['./src/index.tsx'],
  mode: 'production',
  plugins:[
    new HtmlWebpackPlugin({
      template: '../build/template.html',
    }),
    new ParallelUglifyPlugin({
      workerCount: 4,
      uglifyJS: {
          output: {
              beautify: false, // 不需要格式化
              comments: false // 保留注释
          },
          compress: { // 压缩
              drop_console: true, // 删除console语句
              collapse_vars: true, // 内嵌定义了但是只有用到一次的变量
              reduce_vars: true // 提取出出现多次但是没有定义成变量去引用的静态值
          },
          warnings: false, // 删除无用代码时不输出警告
      }
    }),
  ],
  optimization: {
    nodeEnv: 'production',
    minimize: true,
    concatenateModules: true,
  }
};
