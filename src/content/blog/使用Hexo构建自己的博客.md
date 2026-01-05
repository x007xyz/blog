---
title: "使用Hexo构建自己的博客"
description: "Hexo是一个基于nodejs的静态化框架，你可以使用MarkDown写文章，Hexo会帮你生成带有漂亮主题的静态文件。 在准备安装Hexo之前，我们需要先安装nodejs，建议安装最新的稳定版。 安装完之后，我们在命令窗口，输入，如果返回当前node版本号，说明你成功安装好了nodejs，然后我们..."
created_at: 2021-08-31
updated_at: 2021-08-31
tags:
  - "Hexo"
  - "Github"
  - "工具"
---

# 安装
Hexo是一个基于nodejs的静态化框架，你可以使用MarkDown写文章，Hexo会帮你生成带有漂亮主题的静态文件。
在准备安装Hexo之前，我们需要先安装[nodejs](https://nodejs.org/zh-cn/download/)，建议安装最新的稳定版。

安装完之后，我们在命令窗口，输入`node -v`，如果返回当前node版本号，说明你成功安装好了nodejs，然后我们运行命令安装Hexo:
```shell
npm install hexo-cli -g
```
npm是node的包管理工具，我们安装nodejs时会安装对应版本的npm，`npm install`命令安装node包，`-g`表示安装到全局。

安装好`hexo-cli`之后，我们就可以构建我们的blog项目了，运行命令初始化博客目录：
```shell
hexo init x007xyz.github.io // 初始化博客目录
cd x007xyz.github.io // 进入对应博客目录
npm install // 安装项目需要的包
```
到这里Hexo就安装好了，现在我们就可以使用Hexo：
1. 运行`hexo server/s`启动服务
2. 运行`hexo generate/g`生成静态资源

# 使用主题
刚搭建完成的网址看起来还是十分简陋的，需要我们进行美化一下，我们需要使用主题进行美化一下，在这里你可以选择你想要的主题：[Hexo主题](https://hexo.io/themes/)

我使用的主题是[pure](https://github.com/cofess/hexo-theme-pure)，在Hexo项目中，运行命令：
```shell
git clone https://github.com/cofess/hexo-theme-pure.git themes/pure
```
然后修改`_config.yml`文件中的theme设置为`theme: pure`，启动服务主题就生效了。

`pure`中有用的一些Hexo的插件实现一些功能，需要我们额外去安装和设置，以[hexo-wordcount](https://github.com/willin/hexo-wordcount)为例，我们来进行插件的安装。

首先我们需要将npm包安装到项目中：
```shell
npm i --save hexo-wordcount
```
然后找到主题文件中的`_config.yml`(在themes/pure目录下)，将postCount的enable设置为true，开始文字统计功能。
```yml
# wordcount
postCount:
  enable: true
  wordcount: true  # 文章字数统计
  min2read: true  # 阅读时长预计 
```
刷新页面，页面已经有相应的统计信息了，但这时语言却是英文，如果需要修改为中文，我们要将项目的`_config.yml`(项目根目录下)中的language设置为zh-CN，然后重新启动服务，统计信息就是使用中文展示了。

# 发布到GitHub Pages

GitHub Pages可以不用购买服务器和域名就让人们能在互联网上访问到你的个人博客，你只需要拥有一个Github账号即可。

将Hexo项目部署到GitHub Pages十分简单，首先你需要创建一个名字为[name].github.io的共有仓库。

然后在项目中安装`hexo-deployer-git`:
```shell
npm install hexo-deployer-git --save
```
然后打开项目的`_config.yml`配置项目地址：
```yml
deploy:
  type: git
  repo: https://github.com/x007xyz/x007xyz.github.io.git
```
运行部署命令`hexo deploy/d`，在浏览器中输入`[name].github.io`就可以看到你部署好的项目了。
# 开始你的第一篇文章
## 新建文章
运行命令
```shell
hexo new article （这里的article写上你的文章的名称）
```
你的source/_posts目录下会生成一个 article.md 文件，在这个文件下就可以写上你的博客内容了。用 Markdown 的语法去写。
## 给文章添加tags
```shell
hexo new page tags
```
在项目中会生成`source/tags/index.md`，将其中的内容修改为：
```
---
title: tags
type: "tags"
---
```
在文章的头部信息添加
```
tags:
  - 标签一
```
就可以给文章打上相应的标签了
## 给文章添加分类
```shell
hexo new page categories
```
在项目中会生成`source/categories/index.md`，将其中的内容修改为：
```
---
title: categories
type: "categories"
---
```
在文章的头部信息添加
```
categories:
  - 分类一
```
就可以将文章进行分类了
## 修改标签和分类的布局
现在我们进入项目的标签和分类项暂时还是无法看到数据的，因为我们需要为他们设置合适的布局方式，`pure`主题提供多种布局方式，具体的方式我们可以查看`theme/pure/_source`markdown文件中配置的layout。

我们将标签页面的layout设置为tags，分类页面的layout设置为categories，进行对应的页面，就可以看到内容了。


