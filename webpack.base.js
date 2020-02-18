const path = require("path");

module.exports = {
  entry: "./src/app/main.js",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "dist")
  }
};
