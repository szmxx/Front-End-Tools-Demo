const { transform } = require("@babel/core");

const fs = require("fs");

const content = fs.readFileSync("./src/app/main.js", "utf-8");

const res = transform(`${content}`, {
  plugins: [require("./plugins/babel-plugin")]
});

fs.existsSync("./dist/main.js") && fs.unlinkSync("./dist/main.js");

fs.writeFileSync("./dist/main.js", res.code, "utf-8");
