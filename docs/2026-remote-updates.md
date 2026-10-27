# 2026 年远程仓库更新记录

来源分支：`origin/main`  
统计范围：2026-01-01 至当前本地已拉取的远程提交  
当前最新提交：`2f09958` / 2026-05-13

## 更新概览

| 日期 | 提交 | 类型 | 更新说明 | 主要文件/目录 |
|---|---|---|---|---|
| 2026-05-13 | `2f09958` | fix | 修复登录/注册页配置泄露 | `src/app/[locale]/(auth)/sign-in/page.tsx`, `src/app/[locale]/(auth)/sign-up/page.tsx`, `src/shared/services/settings.ts` |
| 2026-05-03 | `45330b6` | fix | 国际化走查、生图链路积分校对、首页展示修正 | `src/app/[locale]/(landing)/page.tsx`, `src/config/locale/messages/**`, `src/shared/blocks/generator/**`, `src/shared/services/ai_task_dispatch.ts` |
| 2026-05-01 | `b203207` | fix | Cloudflare 部署、lint/typecheck、admin 功能和关键词修正 | `package.json`, `pnpm-lock.yaml`, `src/app/[locale]/(admin)/**`, `src/app/api/**`, `src/config/db/schema.*.ts`, `src/shared/lib/**`, `src/shared/services/**` |
| 2026-04-30 | `8b65b41` | fix | 个人中心布局优化、admin 看板修复 | `src/app/[locale]/(admin)/admin/*dashboard*`, `src/app/[locale]/(landing)/settings/**`, `src/config/locale/messages/**/sidebar.json`, `src/shared/blocks/console/layout.tsx` |
| 2026-04-30 | `1ba0c01` | fix | admin 看板布局、生图任务 mock 查询次数 | `src/app/[locale]/(admin)/admin/dashboard-client.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/**`, `src/shared/blocks/generator/image.tsx`, `src/shared/services/ai_task_status.ts` |
| 2026-04-30 | `bf7f435` | feat | 生图功能升级 | `public/imgs/demos/**`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/**`, `src/app/[locale]/(admin)/admin/ai-tasks/**`, `src/app/[locale]/(landing)/activity/ai-tasks/**`, `src/app/api/ai/**`, `src/extensions/ai/**`, `src/shared/services/ai_task_*`, `src/shared/blocks/generator/**` |
| 2026-03-18 | `13fa10c` | chore | 同步 shipany-template 1.8.2 更新 | `next.config.mjs`, `src/app/[locale]/(oauth)/**`, `src/shared/blocks/sign/**` |
| 2026-03-06 | `19d27f4` | fix | 修复 Vercel 部署失败 / CVE-2026-0969 | `package.json`, `pnpm-lock.yaml` |
| 2026-02-11 | `43068fa` | fix | 修复下拉、弹窗切换时滚动条问题 | `src/config/style/global.css` |
| 2026-02-11 | `08c61d8` | fix | 价格国际化校准 | `src/app/[locale]/(landing)/pricing/page.tsx`, `src/config/locale/messages/en/pages/pricing.json`, `src/config/locale/messages/zh/pages/pricing.json` |
| 2026-02-11 | `43a2849` | chore | 同步 dev 更新 | `public/preview.png` |
| 2026-02-10 | `736247c` | fix | 移除 cases/features 图片，缩减包大小 | `content/logs/**`, `content/posts/**`, `public/imgs/cases/**`, `public/imgs/features/**`, `src/config/locale/messages/**/pages/index.json`, `src/config/locale/messages/**/pages/showcases.json` |
| 2026-02-09 | `37c2bff` | feat | 更新 README | `README.md` |
| 2026-02-05 | `50588a6` | fix | R2 配置改为通过 endpoint 配置 Account ID | `src/extensions/storage/r2.ts`, `src/shared/services/storage.ts` |
| 2026-02-03 | `a4dd485` | feat | 添加预制数据 SQL | `.gitignore`, `db/prompt_rows.sql`, `db/showcase_rows.sql` |
| 2026-01-31 | `6bc2078` | fix | 修复偶现登录后 Not found、右上角用户信息未及时刷新 | `src/middleware.ts`, `src/shared/blocks/common/locale-selector.tsx`, `src/shared/blocks/sign/sign-user.tsx`, `tsconfig.json` |
| 2026-01-23 | `f992852` | feat | 更新 README | `README.md` |
| 2026-01-18 | `dbc9bf4` | feat | 支持 Paypal 订阅扣费 | `package.json`, `pnpm-lock.yaml`, `src/extensions/payment/paypal.ts`, `src/extensions/payment/stripe.ts`, `src/app/api/payment/**`, `src/shared/services/payment.ts`, `src/shared/models/order.ts`, `src/config/locale/messages/**`, `src/themes/default/**` |
| 2026-01-10 | `91acf03` | feat | 添加 Claude skills | `.claude/skills/shipany-page-builder/**`, `.claude/skills/shipany-quick-start/**` |

## 按模块汇总

### 1. AI 生图 / AI 任务

主要集中在 2026-04-30 到 2026-05-03。

主要文件：

```text
src/app/[locale]/(admin)/admin/ai-image-dashboard/**
src/app/[locale]/(admin)/admin/ai-tasks/**
src/app/[locale]/(landing)/activity/ai-tasks/**
src/app/api/ai/**
src/extensions/ai/**
src/shared/blocks/generator/**
src/shared/services/ai_task_*
src/shared/lib/image-generation.ts
src/shared/models/ai_task.ts
public/imgs/demos/**
```

### 2. Admin 后台

主要文件：

```text
src/app/[locale]/(admin)/admin/**
src/shared/blocks/admin/**
src/shared/blocks/dashboard/**
src/shared/lib/admin-content.ts
src/shared/services/admin-dashboard.ts
src/shared/services/admin-ai-image-dashboard.ts
src/core/rbac/permission.ts
```

### 3. 登录 / 注册 / OAuth

主要文件：

```text
src/app/[locale]/(auth)/sign-in/page.tsx
src/app/[locale]/(auth)/sign-up/page.tsx
src/app/[locale]/(oauth)/**
src/shared/blocks/sign/**
src/core/auth/**
src/middleware.ts
```

### 4. 支付 / Paypal 订阅

主要文件：

```text
src/app/api/payment/**
src/extensions/payment/paypal.ts
src/extensions/payment/stripe.ts
src/shared/services/payment.ts
src/shared/models/order.ts
package.json
pnpm-lock.yaml
```

### 5. 多语言 / 文案

主要文件：

```text
src/config/locale/index.ts
src/config/locale/messages/en/**
src/config/locale/messages/zh/**
```

### 6. 页面与主题

主要文件：

```text
src/app/[locale]/(landing)/**
src/themes/default/**
src/config/style/global.css
src/config/style/theme.css
content/**
```

### 7. 数据库 / 预制数据

主要文件：

```text
db/prompt_rows.sql
db/showcase_rows.sql
src/config/db/schema.mysql.ts
src/config/db/schema.postgres.ts
src/config/db/schema.sqlite.ts
```

### 8. 存储 / R2

主要文件：

```text
src/extensions/storage/r2.ts
src/shared/services/storage.ts
src/app/api/storage/upload-image/route.ts
src/app/api/ai/storage/retry-r2/route.ts
```

### 9. 项目配置 / 依赖

主要文件：

```text
package.json
pnpm-lock.yaml
next.config.mjs
eslint.config.mjs
tsconfig.json
.gitignore
```

### 10. Skills / 自动化辅助

主要文件：

```text
.claude/skills/shipany-page-builder/**
.claude/skills/shipany-quick-start/**
```
