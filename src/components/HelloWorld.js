// import 和 module.exports不能混用，即不能存在同一个文件里面
const getPersonInfo = require("../utils/HelloWorld.js");
module.exports = class HelloWorld {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }
  sayName() {
    console.log(this.name);
  }
  sayAge() {
    console.log(this.age);
  }
  reset() {
    const { name, age } = getPersonInfo();
    this.name = name;
    this.age = age;
    console.log(name, age);
  }
};
