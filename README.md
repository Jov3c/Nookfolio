<div align="center">

# Nookfolio

### 一个安静、完整且可自行部署的个人网站系统

将个人主页、作品集、博客和内容管理集中在同一个地方。

</div>

---

## 关于 Nookfolio

Nookfolio 是一套面向个人创作者和开发者的自托管网站系统。它既可以作为个人主页与作品集，也可以用于长期写作、整理个人经历，并通过独立的管理后台维护内容。

项目采用克制的视觉语言，强调内容、留白和清晰的信息层级。站点名称、个人资料、导航入口、社交链接及主要内容均可自行配置。

## 主要功能

| 内容展示 | 写作与互动 | 站点管理 |
| --- | --- | --- |
| 可配置的个人首页 | 博客文章与分类 | 中文管理后台 |
| 项目列表与项目详情 | 归档、评论与留言 | 媒体上传与管理 |
| 个人简历与时间线 | 友链展示与申请 | 导航和品牌配置 |
| 响应式页面布局 | 邮箱验证与访问统计 | SEO 与站点信息 |

## 技术构成

| 层级 | 采用技术 |
| --- | --- |
| Web | Nuxt 4、Vue 3、TypeScript |
| 数据 | PostgreSQL 16、Prisma ORM |
| 质量 | Vitest、Playwright、ESLint、Prettier |
| 部署 | Docker Compose、Nginx |

## 快速开始

### 环境要求

- Node.js 24.14.0
- pnpm 11.15.1
- PostgreSQL 16

### 本地运行

```powershell
corepack enable
corepack prepare pnpm@11.15.1 --activate
pnpm install --frozen-lockfile
Copy-Item .env.example .env
pnpm db:up
pnpm prisma:generate
pnpm prisma:migrate:deploy
pnpm admin:bootstrap
pnpm site:init
pnpm dev
```

启动后访问 `http://localhost:3000`。首次运行前，请先修改 `.env` 中的数据库连接、管理员账号、密码和会话密钥。

`site:init` 仅补充缺失的教程占位内容，不会覆盖已有数据。

## Docker 部署

```powershell
Copy-Item .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

部署前请修改 `.env.production` 中的数据库密码、会话密钥、管理员信息、端口和数据目录。

## 项目结构

```text
app/        页面、组件与前端样式
server/     接口、业务服务与数据访问
shared/     前后端共享结构
prisma/     数据模型与数据库迁移
docker/     容器入口与代理配置
scripts/    初始化与维护脚本
tests/      自动化质量验证
```

## 数据说明

运行数据、上传文件、数据库备份、TLS 证书和环境变量均保存在仓库之外。公开仓库只包含运行与维护 Nookfolio 所需的源码、配置和数据库迁移。

请勿将 `.env`、真实用户数据、上传内容或生产环境密钥提交到 Git。
