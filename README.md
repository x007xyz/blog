# 极简博客

一个基于 [Astro](https://astro.build) 构建的极简风格博客系统，专注于内容创作和阅读体验。

## ✨ 特性

- 🚀 **极速性能** - 基于 Astro 的静态站点生成，提供极致的加载速度
- 📝 **Markdown 支持** - 使用 Markdown 编写博客文章，简单高效
- 🎨 **极简设计** - 专注于内容本身，提供优雅的阅读体验
- 🔧 **管理后台** - 内置管理面板，支持在线编辑和发布文章
- 📱 **响应式设计** - 完美适配各种设备尺寸
- 🏷️ **标签系统** - 支持文章分类和标签管理
- ⚡ **现代化技术栈** - React、Tailwind CSS、TypeScript

## 🛠️ 技术栈

- **框架**: [Astro](https://astro.build) 5.x
- **UI 库**: React 19
- **样式**: Tailwind CSS 4.x
- **编辑器**: BlockNote
- **语言**: TypeScript
- **包管理**: pnpm

## 📁 项目结构

```
/
├── public/              # 静态资源文件
│   └── favicon.svg
├── src/
│   ├── assets/         # 图片等资源
│   ├── components/     # 组件
│   │   ├── Admin/      # 管理后台组件
│   │   └── Welcome.astro
│   ├── content/        # 内容文件
│   │   └── blog/       # 博客文章（Markdown）
│   ├── layouts/        # 布局组件
│   ├── pages/          # 页面路由
│   │   ├── admin/      # 管理后台页面
│   │   ├── api/        # API 路由
│   │   └── blog/       # 博客文章页面
│   └── styles/         # 全局样式
├── astro.config.mjs    # Astro 配置文件
├── package.json
└── tsconfig.json
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

启动本地开发服务器：

```bash
pnpm dev
```

访问 [http://localhost:4321](http://localhost:4321) 查看效果。

### 构建生产版本

```bash
pnpm build
```

构建产物将输出到 `./dist/` 目录。

### 预览生产构建

```bash
pnpm preview
```

## 📝 使用指南

### 创建博客文章

在 `src/content/blog/` 目录下创建 Markdown 文件，文件头部需要包含 frontmatter：

```markdown
---
title: "文章标题"
description: "文章描述"
created_at: 2025-01-01
updated_at: 2025-01-01
tags: ["标签1", "标签2"]
---

# 文章内容

这里是文章的正文内容...
```

### 管理后台

访问 `/admin` 路径进入管理后台，可以：
- 查看所有文章列表
- 创建新文章
- 编辑现有文章
- 删除文章

## 📚 相关资源

- [Astro 官方文档](https://docs.astro.build)
- [Astro Discord 社区](https://astro.build/chat)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React 文档](https://react.dev)

## 📄 许可证

MIT License

---

## 🌐 托管声明

本项目由阿里云 ESA 提供加速、计算和保护。

![阿里云 ESA Pages](/public/esa-banner.png)

> 阿里云 ESA Pages - 构建、加速并保护你的网站
