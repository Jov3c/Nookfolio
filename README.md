# JOV3

基于 Nuxt 4、PostgreSQL 和 Prisma 的个人网站，包含首页、项目、博客、归档、友链、留言、个人简历、时间线及管理后台。

## 环境要求

- Node.js 24.14.0
- pnpm 11.15.1
- PostgreSQL 16

## 本地开发

```powershell
corepack enable
corepack prepare pnpm@11.15.1 --activate
pnpm install
Copy-Item .env.example .env
pnpm db:up
pnpm prisma:generate
pnpm prisma:migrate:deploy
pnpm admin:bootstrap
pnpm site:init
pnpm dev
```

首次运行前请修改 `.env` 中的管理员账号、密码和数据库连接。`site:init` 只会补充缺失的教程占位内容，不会覆盖已经存在的数据。

## 本地生产部署

```powershell
Copy-Item .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

部署前应修改 `.env.production` 中的数据库密码、会话密钥、管理员信息、端口和数据目录。生产数据、上传文件、TLS 证书及环境变量均保存在仓库之外，不会提交到 Git。

## 常用命令

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm build
```

```bash
pnpm prisma:migrate:dev
pnpm prisma:studio
pnpm db:logs
pnpm db:down
```

## 仓库内容

仓库仅保留应用源码、数据库迁移、自动化测试、部署配置和必要说明。依赖、构建结果、测试报告、运行数据、上传文件、备份、环境变量及临时工作目录均由忽略规则排除。
