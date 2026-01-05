---
title: "使用Issue进行项目管理"
description: "Issue翻译成中文是指问题，争论点，在GitLab中可以认为是一项待完成的任务，我们可以发起一个Issue来提交软件的bug，也可以将功能的开发作为一个Issue。Issue可以简单的理解为GitLab自带的项目管理工具。 !B0BF2091C2D929B9 一个Issue包含了以下信息： 1...."
created_at: 2021-09-01
updated_at: 2021-09-01
tags:
  - "GitLab"
  - "工具"
---

# Issue是什么
> Issue翻译成中文是指问题，争论点，在GitLab中可以认为是一项待完成的任务，我们可以发起一个Issue来提交软件的bug，也可以将功能的开发作为一个Issue。Issue可以简单的理解为GitLab自带的项目管理工具。

# 在GitLab中使用Issue
## 创建Issue

![B0BF2091C2D929B9](https://qiniu.900fe.com/B0BF2091C2D929B9.png)

一个Issue包含了以下信息：
1. 标题，描述——这个Issue是干什么的
2. Assignee这个任务分配给谁
3. Label标签
4. Milestone对应的版本
5. Due Date预计完成的时间

创建Issue之后，可以在相关的Issue下进行讨论和问题跟踪：

![AB23220262D21A91](https://qiniu.900fe.com/AB23220262D21A91.png)

基于Issue我们可以拉取分支，在拉取的分支上解决了Issue的问题之后，提交远程分支，就可以发起Merge Request，合并通过之后就可以关闭这个Issue。

> 老版本的GitLab拉取分支时无法指定分支的来源（Source），只能从默认分支中拉取，发起合并时，也只有合并到默认分支才可以自动关闭Issue。

![AE3AAE0B5A3EF60E](https://qiniu.900fe.com/AE3AAE0B5A3EF60E.png)

想要关闭Issue，我们也可以在Issue的界面直接点击关闭Issue的按钮，或者在看板界面，直接拖拽到关闭面板。

除了在控制台操作，另外我们还可以在merge和commit时，使用close #+issues序号来关闭Issue；在merge中使用，当merge通过后issue会被关闭；在commit中使用，只有commit推送到默认分支时才会生效。close命令不用这么精确，像closing、closed等都可以，下面是官方说明：

> This translates to the following keywords: Close, Closes, Closed, Closing, close, closes, closed, closing Fix, Fixes, Fixed, Fixing, fix, fixes, fixed, fixing Resolve, Resolves, Resolved, Resolving, resolve, resolves, resolved, resolving Implement, Implements, Implemented, Implementing, implement, implements, implemented, implementing

## Label

创建标签可以方便对issue进行查找和管理，标签一般分为两种，issue类型和issue状态。issue状态可以用来构建看板栏目，issue类型用来标记issue的作用，如bug、feature等。

![EB1E8808DDCA1D4C](https://qiniu.900fe.com/EB1E8808DDCA1D4C.png)

## MileStones

MileStones是一个时间概念，可以和Due Date一样能对issue进行时间上的管理，和Due Date不同，我们可以将多个issue划分到某个MileStones下统一管理，以时间维度进行issue管理，可以当做对项目进行版本迭代管理。

![7D35FC500B443A3E](https://qiniu.900fe.com/7D35FC500B443A3E.png)

# git工作流
![04832EFCA701A0A2](https://qiniu.900fe.com/04832EFCA701A0A2.png)
我们的仓库中固定存在三个分支：
* master默认分支，生产环境运行代码
* backup备份分支，上个版本代码，用于紧急情况直接进行回滚操作
* release发布分支，用于测试环境功能测试

所有功能开发和bug修改都应该创建issue，然后拉取分支，这个分支应该从master拉取，不能从release中拉取，一是因为release可能存在正在测试的功能，二是release中正在测试的代码可能并不会上线或者说并不会在当前需求之前上线；当功能开发完成之后如果需要进行测试，我们必须先拉取release进行合并（merge），然后才能推送到远程仓库，在远程仓库进行Merge Request；当release通过测试后，将release合并到master然后发布master，当然合并之前先将master合并到backup分支进行备份。

在一般情况一个release分支足够了，但是如果需求迭代比较多，而且上线时间不确定可以直接使用issue创建的分支进行测试，或者将多个issue合并为版本分支进行测试，然后将分支合并到master上。