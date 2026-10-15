# Nookfolio — 个人网站与内容管理系统

一套基于 Nuxt 4、Vue 3、PostgreSQL 和 Prisma 的个人网站解决方案，包含个人主页、项目展示、博客、在线简历、人生时间线和统一管理后台。

---

## 功能特性

### 个人主页

- 展示个人名称、简介、头像与社交链接
- 自定义首页导航入口、描述、排序和打开方式
- 导航图标支持媒体库上传或远程图片地址
- 站点角标支持自定义文字与图片
- 响应式布局与滚动进入动画

### 项目展示

- 项目列表与独立详情页
- 项目状态、技术栈、源码地址和演示地址
- 支持 Markdown 项目说明
- 项目卡片触点光斑与轻微倾斜交互
- 后台创建、编辑、删除和排序

### 博客

- Markdown 文章发布与渲染
- 文章分类、归档、阅读量和字数统计
- 评论、嵌套回复与审核状态管理
- 独立留言板与私密留言
- 友情链接展示、申请与审核
- RSS、Sitemap 和基础 SEO 元数据
- 邮箱验证与防滥用频率限制

### 个人资料

- 在线简历与打印样式
- 工作经历、教育经历和技能分组
- 精选项目关联
- 人生时间线与相关媒体、链接
- 个人资料均可在后台持续维护

### 管理后台

- 文章、分类和项目管理
- 评论、留言和友情链接管理
- 首页资料、个人简历与时间线管理
- 媒体上传、替代文字和文件删除
- 站点访问数据概览
- 分组侧边导航、保存提醒与响应式布局

---

## 技术架构

```text
┌─────────────────────────────────────────────────────┐
│                    Nuxt 4 Web App                   │
│  Home · Projects · Blog · CV · Timeline · Admin   │
└──────────────────────────┬──────────────────────────┘
                           │ /api/v1
                           ▼
┌─────────────────────────────────────────────────────┐
│                 Nitro Server Routes                │
│       Services · Repositories · Validation         │
└──────────────────────────┬──────────────────────────┘
                           │ Prisma
                           ▼
                    ┌──────────────┐
                    │ PostgreSQL 16│
                    └──────────────┘

图片与附件 ──► 本地持久化目录
邮件验证   ──► SMTP 服务（可选）
生产入口   ──► Nginx / Docker Compose
```

### 应用技术栈

| 技术                   | 说明                       |
| ---------------------- | -------------------------- |
| Nuxt 4                 | 全栈应用框架与服务端渲染   |
| Vue 3                  | 前端界面与交互             |
| TypeScript             | 类型安全的应用代码         |
| Nitro                  | 服务端路由与生产运行时     |
| Prisma ORM             | 数据模型、迁移与数据库访问 |
| PostgreSQL 16          | 关系型数据库               |
| Zod                    | 请求数据校验               |
| Marked + sanitize-html | Markdown 渲染与内容清洗    |
| Nodemailer             | 邮件验证发送               |

### 工程与部署

| 技术              | 说明                     |
| ----------------- | ------------------------ |
| Vitest            | 单元测试与数据库集成测试 |
| Playwright        | 浏览器端到端测试         |
| ESLint + Prettier | 代码质量与格式检查       |
| GitHub Actions    | 持续集成                 |
| Docker Compose    | 生产服务编排             |
| Nginx             | HTTPS 入口与反向代理     |

---

## 项目结构

```text
nookfolio/
├── app/                    # 页面、布局、组件与前端样式
├── server/
│   ├── api/                # HTTP API
│   ├── repositories/       # 数据访问层
│   ├── services/           # 业务逻辑
│   └── utils/              # 服务端工具
├── shared/                 # 前后端共享结构与常量
├── prisma/
│   ├── migrations/         # 数据库迁移
│   ├── schema.prisma       # 数据模型
│   └── seed.ts             # 管理员初始化入口
├── tests/                  # 单元、集成与端到端测试
├── docker/                 # 容器入口与 Nginx 配置
├── scripts/                # 初始化、备份与维护脚本
├── docker-compose.yml      # 本地 PostgreSQL
└── docker-compose.production.yml
```

---

## 快速开始

### 环境要求

| 环境       | 版本要求 |
| ---------- | -------- |
| Node.js    | 24.14.0  |
| pnpm       | 11.15.1  |
| PostgreSQL | 16       |

### 1. 克隆项目

```bash
git clone https://github.com/Jov3c/nookfolio.git
cd nookfolio
```

### 2. 安装依赖

```bash
corepack enable
corepack prepare pnpm@11.15.1 --activate
pnpm install --frozen-lockfile
```

### 3. 配置环境变量

PowerShell：

```powershell
Copy-Item .env.example .env
```

Linux / macOS：

```bash
cp .env.example .env
```

至少需要修改以下配置：

| 配置项               | 说明                |
| -------------------- | ------------------- |
| `DATABASE_URL`       | PostgreSQL 连接地址 |
| `ADMIN_EMAIL`        | 初始管理员邮箱      |
| `ADMIN_PASSWORD`     | 初始管理员密码      |
| `ADMIN_DISPLAY_NAME` | 管理员显示名称      |
| `PUBLIC_SITE_URL`    | 网站公开地址        |

需要邮箱验证时，再配置 `SMTP_HOST`、`SMTP_USER`、`SMTP_PASSWORD`、`SMTP_FROM_NAME` 和 `SMTP_FROM_EMAIL`。

### 4. 启动数据库

```bash
pnpm db:up
```

### 5. 初始化应用

```bash
pnpm prisma:generate
pnpm prisma:migrate:deploy
pnpm admin:bootstrap
pnpm site:init
```

`site:init` 仅补充缺失的教程占位内容，不覆盖已经存在的数据。

### 6. 启动开发服务器

```bash
pnpm dev
```

访问地址：

| 页面     | 地址                          |
| -------- | ----------------------------- |
| 前台网站 | `http://localhost:3000`       |
| 管理后台 | `http://localhost:3000/admin` |

---

## 生产部署

### Docker Compose

复制生产环境配置：

```powershell
Copy-Item .env.production.example .env.production
```

启动服务：

```bash
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

部署前必须替换数据库密码、管理员密码、会话密钥、公开站点地址、端口和持久化目录。生产数据默认保存在仓库之外。

### 更新应用

```bash
git pull --ff-only
docker compose --env-file .env.production -f docker-compose.production.yml up -d --build
```

应用容器启动时会执行已提交的数据库迁移。

---

## 常用命令

| 命令                    | 说明                     |
| ----------------------- | ------------------------ |
| `pnpm dev`              | 启动开发服务器           |
| `pnpm build`            | 构建生产应用             |
| `pnpm lint`             | 检查代码规范             |
| `pnpm typecheck`        | 检查 TypeScript 类型     |
| `pnpm test`             | 运行单元测试             |
| `pnpm test:integration` | 运行数据库集成测试       |
| `pnpm test:e2e`         | 运行浏览器端到端测试     |
| `pnpm verify`           | 执行本地完整质量检查     |
| `pnpm prisma:studio`    | 打开 Prisma 数据管理界面 |
| `pnpm db:logs`          | 查看本地数据库日志       |
| `pnpm db:down`          | 停止本地数据库           |

---

## 数据与安全

- `.env`、生产密钥和真实用户数据不会提交到 Git。
- 数据库、上传文件、TLS 证书和备份通过外部目录持久化。
- 管理员密码使用 Argon2 哈希保存，会话 Cookie 仅保存不可逆令牌哈希。
- 用户提交的 Markdown 会在输出前清洗。
- 评论、留言、友链申请和登录接口包含频率限制。

公开仓库仅保留应用源码、数据库迁移、自动化测试和部署配置，不包含本地运行数据、上传内容、构建产物或过程文档。
