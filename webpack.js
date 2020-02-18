const parser = require("@babel/parser");
const { transformFromAst } = require("@babel/core");
const traverse = require("@babel/traverse").default;
const fs = require("fs");
const config = require("./webpack.base");
const path = require("path");

const Parser = {
  getAst: function(path) {
    const content = fs.readFileSync(path, "utf-8");
    return parser.parse(content, {
      sourceType: "module"
    });
  },
  getDependecies: function(ast, filename) {
    const dependecies = {};
    traverse(ast, {
      ImportDeclaration({ node }) {
        const dirname = path.dirname(filename);
        let filepath = "./" + path.join(dirname, node.source.value);
        dependecies[node.source.value] = filepath.replace(/\\/g, "/");
      },
      CallExpression({ node }) {
        const dirname = path.dirname(filename);
        if (node.callee.name === "require") {
          let filepath = node.arguments[0].value,
            fileDir = "";
          if (filepath.includes("..")) {
            let dirIndex = dirname.lastIndexOf("/");
            let dir = dirname.substr(0, dirIndex);
            fileDir = filepath.replace("..", dir);
          } else if (filepath.includes(".")) {
            fileDir = filepath.replace(".", dirname);
          }
          dependecies[filepath] = fileDir;
        }
      }
    });
    return dependecies;
  },
  getCode(ast) {
    const { code } = transformFromAst(ast, null, {
      presets: ["@babel/preset-env"]
    });
    return code;
  }
};

class Compiler {
  constructor(options) {
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;
    this.modules = [];
  }
  run() {
    const info = this.build(this.entry);
    this.modules.push(info);
    this.modules.forEach(({ dependecies }) => {
      if (dependecies) {
        for (let dependency in dependecies) {
          this.modules.push(this.build(dependecies[dependency]));
        }
      }
    });
    const dependencyGraph = this.modules.reduce(
      (graph, item) => ({
        ...graph,
        // 使用文件路径作为每个模块的唯一标识符,保存对应模块的依赖对象和文件内容
        [item.filename]: {
          dependecies: item.dependecies,
          code: item.code
        }
      }),
      {}
    );
    this.generate(dependencyGraph);
  }
  build(filename) {
    const { getAst, getDependecies, getCode } = Parser;
    const ast = getAst(filename);
    const dependecies = getDependecies(ast, filename);
    const code = getCode(ast);
    return {
      filename,
      dependecies,
      code
    };
  }
  generate(code) {
    const filepath = path.join(this.output.path, this.output.filename);
    const bundle = `(function(graph){
      function require(module){
        function localRequire(relativePath){
          return require(graph[module].dependecies[relativePath])
        }
        let exports = {};
        (function(require,exports,code){
          eval(code);
        })(localRequire,exports,graph[module].code)
        return exports;
      }
      require('${this.entry}')
    })(${JSON.stringify(code)})`;
    fs.writeFileSync(filepath, bundle, "utf-8");
    (function(graph) {
      function require(module) {
        function localRequire(relativePath) {
          return require(graph[module].dependecies[relativePath]);
        }
        let exports = {};
        (function(require, exports, code) {
          eval(code);
        })(localRequire, exports, graph[module].code);
        return exports;
      }
      require("./src/app/main.js");
    })({
      "./src/app/main.js": {
        dependecies: {
          "../utils/Record.js": "./src/utils/Record.js",
          "../components/HelloWorld.js": "./src/components/HelloWorld.js"
        },
        code:
          '"use strict";\n\nvar _Record = require("../utils/Record.js");\n\n(0, _Record.startProgram)();\n\nvar HelloWorld = require("../components/HelloWorld.js");\n\nvar person = new HelloWorld("weicong", 25);\nperson.sayName();\nperson.sayAge();\ndocument.getElementsByClassName("pText")[0].innerHTML = "dfg";\n(0, _Record.stopProgram)();'
      },
      "./src/utils/Record.js": {
        dependecies: {},
        code:
          '"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.stopProgram = exports.startProgram = void 0;\n\nvar startProgram = function startProgram() {\n  console.log("program start!");\n};\n\nexports.startProgram = startProgram;\n\nvar stopProgram = function stopProgram() {\n  console.log("stop program!");\n};\n\nexports.stopProgram = stopProgram;'
      },
      "./src/components/HelloWorld.js": {
        dependecies: { "../utils/HelloWorld.js": "./src/utils/HelloWorld.js" },
        code:
          '"use strict";\n\nvar _HelloWorld = require("../utils/HelloWorld.js");\n\nfunction _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }\n\nfunction _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }\n\nfunction _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }\n\nmodule.exports =\n/*#__PURE__*/\nfunction () {\n  function HelloWorld(name, age) {\n    _classCallCheck(this, HelloWorld);\n\n    this.name = name;\n    this.age = age;\n  }\n\n  _createClass(HelloWorld, [{\n    key: "sayName",\n    value: function sayName() {\n      console.log(this.name);\n    }\n  }, {\n    key: "sayAge",\n    value: function sayAge() {\n      console.log(this.age);\n    }\n  }, {\n    key: "reset",\n    value: function reset() {\n      var _getPersonInfo = (0, _HelloWorld.getPersonInfo)(),\n          name = _getPersonInfo.name,\n          age = _getPersonInfo.age;\n\n      this.name = name;\n      this.age = age;\n      console.log(name, age);\n    }\n  }]);\n\n  return HelloWorld;\n}();'
      }
    });
  }
}

new Compiler(config).run();
