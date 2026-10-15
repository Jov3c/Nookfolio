# Nookfolio

一个可自行部署的个人主页、作品集与博客发布系统。

Nookfolio 基于 Nuxt 4、PostgreSQL 与 Prisma 构建，将个人主页、项目展示、博客写作、访客互动和内容管理整合在同一套简洁的界面中。站点资料、导航、内容和品牌文字均可在后台维护。

## 功能

- 可配置的个人主页、导航入口与社交链接
- 项目列表、项目详情与交互式项目卡片
- 博客文章、分类、归档、友链、评论与留言
- 个人简历与人生时间线
- 中文内容管理后台与媒体库
- 图片上传、远程图标地址和站点品牌配置
- 邮箱验证、访问统计与基础 SEO 元数据
- 本地开发和 Docker 生产部署配置
- 单元测试、集成测试、端到端测试与持续集成

## 技术栈

- [Nuxt 4](https://nuxt.com/) 与 Vue 3
- PostgreSQL 16 与 Prisma ORM
- TypeScript、Vitest 与 Playwright
- Docker Compose 与 Nginx

## 环境要求

- Node.js 24.14.0
- pnpm 11.15.1
- PostgreSQL 16；也可以使用仓库中的开发数据库配置

## 本地开发

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

应用默认运行在 `http://localhost:3000`。首次启动前，请修改 `.env` 中的数据库连接、管理员账号、密码和会话密钥。`site:init` 只补充缺失的教程占位内容，不覆盖已有数据。

## 生产部署

```powershell
Copy-Item .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

部署前必须替换 `.env.production` 中的数据库密码、会话密钥、管理员信息、端口和数据目录。运行数据、上传文件、证书、备份及环境变量均保存在仓库之外。

## 常用命令

| 命令                    | 用途                                     |
| ----------------------- | ---------------------------------------- |
| `pnpm dev`              | 启动本地开发服务器                       |
| `pnpm build`            | 构建生产版本                             |
| `pnpm format:check`     | 检查代码格式                             |
| `pnpm lint`             | 执行静态检查                             |
| `pnpm typecheck`        | 执行 TypeScript 类型检查                 |
| `pnpm test`             | 运行单元测试                             |
| `pnpm test:integration` | 运行数据库集成测试                       |
| `pnpm test:e2e`         | 运行浏览器端到端测试                     |
| `pnpm verify`           | 执行格式、静态检查、类型、单元测试和构建 |

## 项目结构

```text
app/                 页面、布局、组件与前端样式
server/              API、业务服务、数据仓库与服务端工具
shared/              前后端共享常量与结构
prisma/              数据模型、迁移与初始化入口
tests/               单元、集成和端到端测试
docker/              容器入口与 Nginx 配置
scripts/             初始化、备份和维护脚本
```

## 数据与仓库约定

仓库只保留运行项目所需的源码、数据库迁移、自动化测试和部署配置。依赖目录、构建产物、测试报告、本地数据库、上传内容、备份、密钥及临时文件均由忽略规则排除。

提交公开仓库前，请确认 `.env`、生产数据和用户上传内容未被纳入版本控制。
