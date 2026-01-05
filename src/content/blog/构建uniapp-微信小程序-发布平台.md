---
title: "构建uniapp(微信小程序)发布平台"
description: "*   node.js调用shell命令     *   原生模块child\_process     *   shelljs     *   simple-git操作git *   发布小程序流程     *   拉取代码     *   发布并上传微信小程序 *   使用koa构建服务..."
created_at: 2022-05-15
updated_at: 2022-05-15
tags:
  - "uniapp"
  - "工具"
---

# 构建uniapp(微信小程序)发布平台

## 目录

*   [node.js调用shell命令](#nodejs调用shell命令)

    *   [原生模块child\_process](#原生模块child_process)

    *   [shelljs](#shelljs)

    *   [simple-git操作git](#simple-git操作git)

*   [发布小程序流程](#发布小程序流程)

    *   [拉取代码](#拉取代码)

    *   [发布并上传微信小程序](#发布并上传微信小程序)

*   [使用koa构建服务](#使用koa构建服务)

    *   [通过websocket调用接口](#通过websocket调用接口)

*   [其他](#其他)

    *   [环境](#环境)

    *   [配置](#配置)

    *   [参考链接](#参考链接)

## node.js调用shell命令

要实现自动发布微信小程序，我们需要拉取代码和调用hbuilder，这些都依赖`shell`脚本，所以我们先来了解一下如何在`node.js`中调用`shell`命令。

### 原生模块child\_process

在`node.js`中可以使用原生的`child_process`模块来调用`shell`命令的形式来执行`git`命令，调用的两种方式：

```bash
child_process.exec(command[, options][, callback])
child_process.execFile(file[, args][, options][, callback])
```

例如执行拉取代码的命令就是`child_process.exec('git pull')`；

### shelljs

我们也可以借助第三方库`shelljs`，它是基于node的一个扩展，比原生的child\_process兼容性更好，使用更灵活。

```javascript
var shell = require('shelljs');

if (!shell.which('git')) {
  shell.echo('Sorry, this script requires git');
  shell.exit(1);
}

// Copy files to release dir
shell.rm('-rf', 'out/Release');
shell.cp('-R', 'stuff/', 'out/Release');

// Replace macros in each .js file
shell.cd('lib');
shell.ls('*.js').forEach(function (file) {
  shell.sed('-i', 'BUILD_VERSION', 'v0.1.2', file);
  shell.sed('-i', /^.*REMOVE_THIS_LINE.*$/, '', file);
  shell.sed('-i', /.*REPLACE_LINE_WITH_MACRO.*\n/, shell.cat('macro.js'), file);
});
shell.cd('..');

// Run external tool synchronously
if (shell.exec('git commit -am "Auto-commit"').code !== 0) {
  shell.echo('Error: Git commit failed');
  shell.exit(1);
}
```

### simple-git操作git

如果操作git命令我们可以使用专门为git设置的库simple-git，示例：

```javascript
const simpleGit = require('simple-git/promise');
const path = require('path');

async function gitinit() {
  const projectPath = path.join(__dirname);
  const cmd = "init";
  const args = "";
  const git = simpleGit(projectPath);

  try {
    const res = await git[cmd](args);
    console.info("res:", res);
  } catch (e) {
    console.error('执行 simple-git 命令时发生错误', {
      projectPath,
      cmd,
      args
    }, e);
    throw e;
  }
}

gitinit();
```

## 发布小程序流程

我们先梳理一下，uniapp开发正常发布小程序的简单流程。

1.  首先拉取最新的代码

2.  使用hbuilder打包并发行

3.  使用微信小程序开发工具上传体验版

以上三个步骤就是小程序发布的简单流程了，我们只需要能够使用代码实现上述的步骤就可以达到我们需求了。下面我们来使用`node.js`来实现一下：

### 拉取代码

使用`git`命令我们就可以拉取代码了，借助`simple-git`我们就可以在`node.js`中操作`git`。

在一般情况下，项目应该是都已经在本地了，我们只需要使用`git pull`拉取最新代码就可以了，但是我们也应该兼容本地代码仓库不存在的情况；现在我们开始构建项目。

首先我们需要创建一个文件夹`project`用来放置我们从远端来取下拉的项目，然后创建`publish.js`用来编写发布逻辑，我们先添加拉取项目的代码：

```javascript
const Git = require('simple-git')
const fse = require('fs-extra')
const dirPath = path.join(__dirname, `./project/${data.name}`)
let git = null
// 查看项目是否存在
if (!fse.pathExistsSync(dirPath)) {
  console.log('项目不存在，开始创建项目')
  // 不存在则git clone
  await Git().clone(remoteUrl, dirPath)
  git = Git(dirPath)
} else {
  console.log('项目存在，拉取最新代码')
  // 存在则git pull
  git = Git(dirPath)
  const logs = await git.pull()
}
// 获取信息的提交信息
const logs = await git.log({ maxCount: 10 })

```

### 发布并上传微信小程序

通过hbuilder提供的[cli命令行工具](https://hx.dcloud.net.cn/cli/publish-mp-weixin "cli命令行工具")我们可以直接使用一行shell命令发布并上传微信小程序：

```bash
# 编译uni-app项目到微信小程序，并发行小程序到微信平台 
cli publish --platform mp-weixin --project 项目名称 --upload true --appid 小程序appid --description 发布描述 --version 发布版本 --privatekey 小程序上传密钥文件
```

发布微信小程序之前，我们需要先将拉取下来的项目使用hbuilder打开，cli命令行工具也提供了这样的功能。

```bash
cli project open --path 项目路径
```

因为我们的项目可能使用了npm包，所以要在发布之前安装所有的npm包。

所以发布命令的执行过程是：

1.  运行`yarn`，安装第三方包

2.  使用hbuilder打开项目

3.  使用hbuilder打包并上传微信小程序

对应的代码如下：

```javascript
// dirPath 是项目路径，config.cli是cli路径
// 打开项目并执行yarn命令
shell.exec(`cd ${dirPath} && yarn`)
// 使用hbuilder打开项目
shell.exec(`${config.cli} project open --path ${dirPath}`)
// 使用hbuilder打包并上传微信小程序
shell.exec(
  `${config.cli} publish --platform mp-weixin --project ${name} --upload true --appid ${appid} --description ${versionDesc} --version ${version} --privatekey ${privatekey}`
)

```

## 使用koa构建服务

完成上面的流程之后，我们使用`node.js`自动发布小程序了，但是实际的应用中，我们需要把这个能力提供给所有的人，所以我们使用`koa`构建web服务将发布的能力对外开放。我们先构建一个简单的`koa`服务：

```javascript
const Koa = require('koa');
const app = new Koa();
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

app.use(bodyParser());

const render = require('koa-art-template');
const path = require('path')

render(app, {
  root: path.join(__dirname, 'view'),
  extname: '.art',
  debug: process.env.NODE_ENV !== 'production'
});

const router = new Router();

router.get('/', async (ctx) => {
  await ctx.render('user');
})

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000, () => {
  console.log('server is running on port 3000');
})
```

### 通过websocket调用接口

发布微信小程序是一个比较漫长的过程，如果在调用的过程中一直不给页面反馈对用户就非常不友好了；而且同一个微信小程序如果正在发布中，不应该能够再次调用发布接口，所以我们使用websocket进行数据交互；现在在`koa`添加`websocket`，然后使用`websocket`返回打印信息：

```javascript
const websockify = require('koa-websocket');
const app = websockify(new Koa());

/**
 * 定义websocket连接
 */
const wsRouter = new Router()

wsRouter.get('/ws/publish/:name', async (ctx) => {
  console.log('ctx', ctx.params);
  require('./publish')(ctx.websocket, ctx.params.name)
  ctx.websocket.on('message', msg => {
    console.log('前端发过来的数据：', msg)
  })
  ctx.websocket.on('close', () => {
    console.log('前端关闭了websocket')
  })
})

app.ws.use(wsRouter.routes()).use(wsRouter.allowedMethods());

```

## 其他

### 环境

1.  mac系统主机（或者window系统主机），因为hbuilder和小程序开发工具只有mac/window版本

2.  安装`node.js`和`yarn`，推荐使用`nvm`进行管理

3.  下载安装[hbuilder](https://www.dcloud.io/hbuilderx.html "hbuilder")和[微信小程序上传CI插件](https://ext.dcloud.net.cn/plugin?name=weapp-miniprogram-ci "微信小程序上传CI插件")

4.  下载安装[微信小程序开发工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html "微信小程序开发工具")

5.  安装[git工具](https://git-scm.com/downloads "git工具")

### 配置

1.  git拉取项目需要[配置SSH密钥](https://help.aliyun.com/document_detail/153709.html "配置SSH密钥")

2.  [hbulider cli命令行工具](https://hx.dcloud.net.cn/cli/README "hbulider cli命令行工具")的相关配置

### 参考链接

[NodeJS运行Shell的方式及搭建运维平台](https://cloud.tencent.com/developer/article/1812689 "NodeJS运行Shell的方式及搭建运维平台")
