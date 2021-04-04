const fs = require("fs");
const path = require("path");
const vm = require("vm");

function Module(id) {
  this.id = id;
  this.exports = {};
}

Module.wrapper = [
  `(function(exports, require, module, __filename, __dirname) {`,

  `})`,
];

Module._extensions = {
  ".js"(module) {
    let content = fs.readFileSync(module.id, "utf8");
    // 用函数包裹
    content = Module.wrapper[0] + content + Module.wrapper[1];
    // 独立作用域
    let fn = vm.runInThisContext(content)
    let exports = module.exports
    let dirname = path.dirname(module.id)
    // 函数执行
    fn.call(exports, require, module, module.id, dirname)
  },
  ".json"(module) {
    let content = fs.readFileSync(module.id, "utf8");
    module.exports = JSON.parse(content);
  },
};

// 处理文件名， 判断文件是否存在
Module._resolveFilename = function(filename) {
  let absPath = path.resolve(__dirname, filename)
  let isExits = fs.existsSync(absPath)
  if (isExits) {
    return absPath
  } else {
    let keys = Object.keys(Module._extensions)
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      let newPath = absPath + key
      let flag = fs.existsSync(newPath)
      if(flag) {
        return newPath
      }
    }
    throw new Error('module not exists')
  }
}

// 使用预设的方法加载文件
Module.prototype.load = function () {
  let extname = path.extname(this.id);
  Module._extensions[extname](this)
};

// 缓存
Module._catch = {};


function rqr(filename) {
  filename = Module._resolveFilename(filename)
  let catchModule = Module._catch[filename]
  if (catchModule) {
    return catchModule.exports
  }
  let module = new Module(filename)
  Module._catch[filename] = module
  module.load()
  return module.exports
}

module.exports = rqr