---
title: "vue项目代码格式规范设置"
description: "为了尽量统一项目成员的代码风格，降低开发者对代码的理解成本，所以我们需要为项目统一代码格式规范；同时我们不能为了降低理解成本，去增加开发成本，所以我们借助VS Code的相关插件去完成代码格式化的功能。 使用构建的项目，在项目构建时，就会让你选择格式化方案，如果是已有项目运行添加格式化方式，建议选择..."
created_at: 2022-05-24
updated_at: 2022-05-24
tags:
  - "VS Code"
  - "Vue"
  - "eslint"
  - "uniapp"
  - "工具"
---

> 为了尽量统一项目成员的代码风格，降低开发者对代码的理解成本，所以我们需要为项目统一代码格式规范；同时我们不能为了降低理解成本，去增加开发成本，所以我们借助VS Code的相关插件去完成代码格式化的功能。

### 为项目添加eslint

使用`vue-cli`构建的项目，在项目构建时，就会让你选择格式化方案，如果是已有项目运行`vue add eslint`添加格式化方式，建议选择`Prettier` 的格式化方案；如果是`uniapp`的项目，如果使用的是`vue-cli`，也是使用`vue add eslint`，如果是使用HBuilder构建打包，需要安装另外安装`@vue/cli-service`，不然`npm run lint`无法正常格式化。

添加eslint之后，根据你的选择，eslint的配置项，可能在`.eslintrc.js`文件中，如果该文件不存在，配置项应该在`package.json`，默认配置应该如下：

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    "plugin:prettier/recommended",
  ],
  parserOptions: {
    parser: "@babel/eslint-parser",
  }
};

```

这些配置不建议改动，如果有其他需求，我们可以在其基础上进行自定义配置。

### 自定义eslint配置

```javascript
module.exports = {
  "root": true,
  "env": {
    "node": true
  },
  "extends": [
    "plugin:vue/essential",
    "plugin:vue/recommended",
    "eslint:recommended",
    "@vue/prettier"
  ],
  "parserOptions": {
    "parser": "babel-eslint"
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
    "no-unused-vars": [
      "error",
      { vars: "all", args: "none", ignoreRestSiblings: true },
    ],
    "vue/order-in-components": ["error", {
      "order": [
        "el",
        "name",
        "key",
        "parent",
        "functional",
        ["delimiters", "comments"],
        ["components", "directives", "filters"],
        "extends",
        "mixins",
        ["provide", "inject"],
        "ROUTER_GUARDS",
        "layout",
        "middleware",
        "validate",
        "scrollToTop",
        "transition",
        "loading",
        "inheritAttrs",
        "model",
        ["props", "propsData"],
        "emits",
        "setup",
        "asyncData",
        "data",
        "fetch",
        "head",
        "computed",
        "watch",
        "watchQuery",
        "LIFECYCLE_HOOKS",
        "onLoad",
        "onShow",
        "onReady",
        "onHide",
        "onUnload",
        "onResize",
        "onPullDownRefresh",
        "onReachBottom",
        "onTabItemTap",
        "onShareAppMessage",
        "onPageScroll",
        "methods",
        ["template", "render"],
        "renderError"
      ]
    }]
  },
  globals: {
    uni: true,
    requirePlugin: true
  },
}

```

推荐的eslint配置如上。

extends中添加了`plugin:vue/recommended`，这个插件是限制了vue的一些代码规范，如组件属性的顺序，vue选项的顺序等。

rules中的`no-console`和`no-debugger`限制了代码中的`console`和`debugger`，在开发环境会生成警告信息，在生产环境会提示报错；`no-unused-vars`对为使用的变量做了限制，除了参数和reset中不允许出现未使用的变量；`vue/order-in-components`是在`uniapp`中对`plugin:vue/recommended`规范的一个补充，`uniapp`中存在许多`vue`没有的选项，设置`vue/order-in-components`将这些没有的选项也进行格式化排序。

globals中添加使用到的全局变量，如果不添加会在格式化时报错。`uni`是`uniapp`常用的全局对象，`requirePlugin`是微信开发用的的全局变量。

### pre-commit设置

pre-commit在`git commit`之前做一些处理，我们需要在提交之前对代码格式规范做检查，避免在项目打包时，出现`eslint`的报错。在项目添加`lint-staged`，然后再`package.json`中配置（我们使用`vue`命令添加`eslint`时，选择commit时格式化，会自动帮我们添加）：

```javascript
"gitHooks": {
  "pre-commit": "lint-staged"
},
"lint-staged": {
  "*.{js,jsx,vue}": [
    "vue-cli-service lint --mode production",
    "git add"
  ]
}
```

### VS Code配置

我们需要用的[eslint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint "eslint")和[vetur](https://marketplace.visualstudio.com/items?itemName=octref.vetur "vetur")这两个插件，eslint插件需要`npm`全局安装`eslint`包，两个插件安装完之后，在VS Code的配置中，设置：

```javascript
"[vue]": {
    "editor.defaultFormatter": "octref.vetur"
}
```

如果无法格式化，可能是格式化工具冲突导致的，设置：

```javascript
// 保存时使用VSCode 自身格式化程序格式化
"editor.formatOnSave": true,
// 保存时用eslint格式化
"editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
｝
// 两者会在格式化js时冲突，所以需要关闭默认js格式化程序 
"javascript.format.enable": false
```

### 参考

[vue风格指南](https://cn.vuejs.org/v2/style-guide/index.html#组件-实例的选项的顺序推荐 "vue风格指南")

[eslint-plugin-vue](https://eslint.vuejs.org/rules/order-in-components.html "eslint-plugin-vue")

[eslint文档](https://cn.eslint.org/docs/user-guide/configuring "eslint文档")
