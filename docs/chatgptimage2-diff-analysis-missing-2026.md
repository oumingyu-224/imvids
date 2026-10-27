# chatgptimage2-diff-analysis.md 缺失信息对照

对照来源：

- `2026-remote-updates.md`
- `2026-remote-updates-vs-chatgptimage2-compare.md`

对照目标：

- `chatgptimage2-diff-analysis.md`

说明：本文件只记录 `chatgptimage2-diff-analysis.md` 相比两个 2026 文件未完整覆盖的信息；文件路径不使用省略写法。

## 1. 缺少 2026 远程更新提交时间线

`chatgptimage2-diff-analysis.md` 没有按提交维度完整覆盖以下信息：

| 日期 | 提交 | 类型 | 更新说明 | 主要文件/目录 |
|---|---|---|---|---|
| 2026-05-13 | `2f09958` | fix | 修复登录/注册页配置泄露 | `src/app/[locale]/(auth)/sign-in/page.tsx`, `src/app/[locale]/(auth)/sign-up/page.tsx`, `src/shared/services/settings.ts` |
| 2026-05-03 | `45330b6` | fix | 国际化走查、生图链路积分校对、首页展示修正 | `src/app/[locale]/(landing)/page.tsx`, `src/config/locale/messages/en/activity/ai-tasks.json`, `src/config/locale/messages/en/activity/sidebar.json`, `src/config/locale/messages/en/admin/ai-tasks.json`, `src/config/locale/messages/en/admin/dashboard.json`, `src/config/locale/messages/en/admin/prompts.json`, `src/config/locale/messages/en/admin/settings.json`, `src/config/locale/messages/en/admin/showcases.json`, `src/config/locale/messages/en/admin/sidebar.json`, `src/config/locale/messages/en/ai/chat.json`, `src/config/locale/messages/en/ai/image.json`, `src/config/locale/messages/en/ai/music.json`, `src/config/locale/messages/en/ai/video.json`, `src/config/locale/messages/en/common.json`, `src/config/locale/messages/en/landing.json`, `src/config/locale/messages/en/pages/blog.json`, `src/config/locale/messages/en/pages/create.json`, `src/config/locale/messages/en/pages/hairstyles.json`, `src/config/locale/messages/en/pages/index.json`, `src/config/locale/messages/en/pages/pricing.json`, `src/config/locale/messages/en/pages/showcases.json`, `src/config/locale/messages/en/pages/updates.json`, `src/config/locale/messages/en/settings/sidebar.json`, `src/config/locale/messages/zh/activity/ai-tasks.json`, `src/config/locale/messages/zh/activity/sidebar.json`, `src/config/locale/messages/zh/admin/ai-tasks.json`, `src/config/locale/messages/zh/admin/dashboard.json`, `src/config/locale/messages/zh/admin/prompts.json`, `src/config/locale/messages/zh/admin/settings.json`, `src/config/locale/messages/zh/admin/showcases.json`, `src/config/locale/messages/zh/admin/sidebar.json`, `src/config/locale/messages/zh/ai/chat.json`, `src/config/locale/messages/zh/ai/image.json`, `src/config/locale/messages/zh/ai/music.json`, `src/config/locale/messages/zh/ai/video.json`, `src/config/locale/messages/zh/common.json`, `src/config/locale/messages/zh/landing.json`, `src/config/locale/messages/zh/pages/blog.json`, `src/config/locale/messages/zh/pages/create.json`, `src/config/locale/messages/zh/pages/hairstyles.json`, `src/config/locale/messages/zh/pages/index.json`, `src/config/locale/messages/zh/pages/pricing.json`, `src/config/locale/messages/zh/pages/showcases.json`, `src/config/locale/messages/zh/settings/sidebar.json`, `src/shared/blocks/generator/image.tsx`, `src/shared/blocks/generator/music.tsx`, `src/shared/blocks/generator/video.tsx`, `src/shared/services/ai_task_dispatch.ts` |
| 2026-05-01 | `b203207` | fix | Cloudflare 部署、lint/typecheck、admin 功能和关键词修正 | `package.json`, `pnpm-lock.yaml`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-dashboard-client.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-trend-charts.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/failed-tasks/page.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/page.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/tasks/page.tsx`, `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts-lazy.tsx`, `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts.tsx`, `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-table.tsx`, `src/app/[locale]/(admin)/admin/ai-tasks/page.tsx`, `src/app/[locale]/(admin)/admin/categories/[id]/edit/page.tsx`, `src/app/[locale]/(admin)/admin/dashboard-client.tsx`, `src/app/[locale]/(admin)/admin/page.tsx`, `src/app/[locale]/(admin)/admin/prompts/[id]/delete/page.tsx`, `src/app/[locale]/(admin)/admin/prompts/[id]/edit/page.tsx`, `src/app/[locale]/(admin)/admin/prompts/add/page.tsx`, `src/app/[locale]/(admin)/admin/prompts/page.tsx`, `src/app/[locale]/(admin)/admin/settings/[tab]/page.tsx`, `src/app/[locale]/(admin)/admin/showcases/[id]/delete/page.tsx`, `src/app/[locale]/(admin)/admin/showcases/[id]/edit/page.tsx`, `src/app/[locale]/(admin)/admin/showcases/add/page.tsx`, `src/app/[locale]/(admin)/admin/showcases/page.tsx`, `src/app/[locale]/(admin)/admin/users/page.tsx`, `src/app/api/ai/generate/route.ts`, `src/app/api/ai/providers/route.ts`, `src/app/api/ai/query/route.ts`, `src/app/api/payment/callback/route.ts`, `src/app/api/payment/checkout/route.ts`, `src/app/api/storage/upload-image/route.ts`, `src/config/db/schema.mysql.ts`, `src/config/db/schema.postgres.ts`, `src/config/db/schema.sqlite.ts`, `src/shared/lib/admin-content.ts`, `src/shared/lib/image-generation.ts`, `src/shared/services/admin-ai-image-dashboard.ts`, `src/shared/services/admin-dashboard.ts`, `src/shared/services/payment.ts`, `src/shared/services/storage.ts` |
| 2026-04-30 | `8b65b41` | fix | 个人中心布局优化、admin 看板修复 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-dashboard-client.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-trend-charts.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/failed-tasks/page.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/page.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/tasks/page.tsx`, `src/app/[locale]/(landing)/settings/billing/page.tsx`, `src/app/[locale]/(landing)/settings/credits/page.tsx`, `src/app/[locale]/(landing)/settings/layout.tsx`, `src/app/[locale]/(landing)/settings/payments/page.tsx`, `src/app/[locale]/(landing)/settings/profile/page.tsx`, `src/config/locale/messages/en/activity/sidebar.json`, `src/config/locale/messages/en/settings/sidebar.json`, `src/config/locale/messages/zh/activity/sidebar.json`, `src/config/locale/messages/zh/settings/sidebar.json`, `src/shared/blocks/console/layout.tsx` |
| 2026-04-30 | `1ba0c01` | fix | admin 看板布局、生图任务 mock 查询次数 | `src/app/[locale]/(admin)/admin/dashboard-client.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-dashboard-client.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-trend-charts.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/failed-tasks/page.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/page.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/tasks/page.tsx`, `src/shared/blocks/generator/image.tsx`, `src/shared/services/ai_task_status.ts` |
| 2026-04-30 | `bf7f435` | feat | 生图功能升级 | `public/imgs/demos/reference-beach-model.jpg`, `public/imgs/demos/reference-vintage-photo.jpg`, `public/imgs/demos/result-anime-figure-showcase.jpg`, `public/imgs/demos/result-blue-hair.jpg`, `public/imgs/demos/result-crochet-doll.jpg`, `public/imgs/demos/result-lego-minifigure.jpg`, `public/imgs/demos/result-red-bikini.jpg`, `public/imgs/demos/result-restored-color-photo.jpg`, `public/imgs/demos/result-starry-night-style.jpg`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-dashboard-client.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-trend-charts.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/failed-tasks/page.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/page.tsx`, `src/app/[locale]/(admin)/admin/ai-image-dashboard/tasks/page.tsx`, `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts-lazy.tsx`, `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts.tsx`, `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-table.tsx`, `src/app/[locale]/(admin)/admin/ai-tasks/page.tsx`, `src/app/[locale]/(landing)/activity/ai-tasks/[id]/download/download-client.tsx`, `src/app/[locale]/(landing)/activity/ai-tasks/[id]/download/page.tsx`, `src/app/[locale]/(landing)/activity/ai-tasks/[id]/refresh/page.tsx`, `src/app/[locale]/(landing)/activity/ai-tasks/page.tsx`, `src/app/api/ai/dispatch/route.ts`, `src/app/api/ai/generate/route.ts`, `src/app/api/ai/notify/[provider]/route.ts`, `src/app/api/ai/providers/route.ts`, `src/app/api/ai/query/route.ts`, `src/app/api/ai/storage/retry-r2/route.ts`, `src/extensions/ai/custom.ts`, `src/extensions/ai/index.ts`, `src/extensions/ai/types.ts`, `src/shared/blocks/generator/image-generator-examples.tsx`, `src/shared/blocks/generator/image.tsx`, `src/shared/blocks/generator/music.tsx`, `src/shared/blocks/generator/video.tsx`, `src/shared/lib/image-generation.ts`, `src/shared/models/ai_task.ts`, `src/shared/services/ai_task_concurrency.test.ts`, `src/shared/services/ai_task_dispatch.ts`, `src/shared/services/ai_task_log.ts`, `src/shared/services/ai_task_mock.ts`, `src/shared/services/ai_task_showcase.ts`, `src/shared/services/ai_task_status.ts` |
| 2026-03-18 | `13fa10c` | chore | 同步 shipany-template 1.8.2 更新 | `next.config.mjs`, `src/app/[locale]/(oauth)/auth-callback/page.tsx`, `src/app/[locale]/(oauth)/auth-popup/page.tsx`, `src/app/[locale]/(oauth)/layout.tsx`, `src/shared/blocks/sign/sign-in-form.tsx`, `src/shared/blocks/sign/sign-in.tsx`, `src/shared/blocks/sign/sign-modal.tsx`, `src/shared/blocks/sign/sign-up-form.tsx`, `src/shared/blocks/sign/sign-up.tsx`, `src/shared/blocks/sign/sign-user.tsx`, `src/shared/blocks/sign/social-providers.tsx`, `src/shared/blocks/sign/verify-email.tsx` |
| 2026-03-06 | `19d27f4` | fix | 修复 Vercel 部署失败 / CVE-2026-0969 | `package.json`, `pnpm-lock.yaml` |
| 2026-02-11 | `43068fa` | fix | 修复下拉、弹窗切换时滚动条问题 | `src/config/style/global.css` |
| 2026-02-11 | `08c61d8` | fix | 价格国际化校准 | `src/app/[locale]/(landing)/pricing/page.tsx`, `src/config/locale/messages/en/pages/pricing.json`, `src/config/locale/messages/zh/pages/pricing.json` |
| 2026-02-11 | `43a2849` | chore | 同步 dev 更新 | `public/preview.png` |
| 2026-02-10 | `736247c` | fix | 移除 cases/features 图片，缩减包大小 | `content/logs/v1.0.mdx`, `content/logs/v1.0.zh.mdx`, `content/logs/v2.0.mdx`, `content/logs/v2.0.zh.mdx`, `content/posts/what-is-xxx.mdx`, `content/posts/what-is-xxx.zh.mdx`, `public/imgs/cases`, `public/imgs/features`, `src/config/locale/messages/en/pages/index.json`, `src/config/locale/messages/en/pages/showcases.json`, `src/config/locale/messages/zh/pages/index.json`, `src/config/locale/messages/zh/pages/showcases.json` |
| 2026-02-09 | `37c2bff` | feat | 更新 README | `README.md` |
| 2026-02-05 | `50588a6` | fix | R2 配置改为通过 endpoint 配置 Account ID | `src/extensions/storage/r2.ts`, `src/shared/services/storage.ts` |
| 2026-02-03 | `a4dd485` | feat | 添加预制数据 SQL | `.gitignore`, `db/prompt_rows.sql`, `db/showcase_rows.sql` |
| 2026-01-31 | `6bc2078` | fix | 修复偶现登录后 Not found、右上角用户信息未及时刷新 | `src/middleware.ts`, `src/shared/blocks/common/locale-selector.tsx`, `src/shared/blocks/sign/sign-user.tsx`, `tsconfig.json` |
| 2026-01-23 | `f992852` | feat | 更新 README | `README.md` |
| 2026-01-18 | `dbc9bf4` | feat | 支持 Paypal 订阅扣费 | `package.json`, `pnpm-lock.yaml`, `src/extensions/payment/paypal.ts`, `src/extensions/payment/stripe.ts`, `src/app/api/payment/callback/route.test.ts`, `src/app/api/payment/callback/route.ts`, `src/app/api/payment/checkout/route.ts`, `src/shared/services/payment.ts`, `src/shared/models/order.ts`, `src/config/locale/messages/en/common.json`, `src/config/locale/messages/en/pages/pricing.json`, `src/config/locale/messages/zh/common.json`, `src/config/locale/messages/zh/pages/pricing.json`, `src/themes/default/blocks/pricing.tsx` |
| 2026-01-10 | `91acf03` | feat | 添加 Claude skills | `.claude/skills/shipany-page-builder`, `.claude/skills/shipany-quick-start` |

## 2. `chatgptimage2-diff-analysis.md` 未显式覆盖的文件路径

以下文件路径出现在两个 2026 文件中，但没有在 `chatgptimage2-diff-analysis.md` 中被显式列出。

### 2.1 AI 生图 / AI 任务

```text
public/imgs/demos/reference-beach-model.jpg
public/imgs/demos/reference-vintage-photo.jpg
public/imgs/demos/result-anime-figure-showcase.jpg
public/imgs/demos/result-blue-hair.jpg
public/imgs/demos/result-crochet-doll.jpg
public/imgs/demos/result-lego-minifigure.jpg
public/imgs/demos/result-red-bikini.jpg
public/imgs/demos/result-restored-color-photo.jpg
public/imgs/demos/result-starry-night-style.jpg
src/app/api/ai/providers/route.ts
src/app/api/ai/storage/retry-r2/route.ts
src/extensions/ai/custom.ts
src/extensions/ai/index.ts
src/extensions/ai/types.ts
src/shared/blocks/generator/music.tsx
src/shared/blocks/generator/video.tsx
src/shared/services/ai_task_concurrency.test.ts
src/shared/services/ai_task_mock.ts
src/shared/services/ai_task_showcase.ts
```

### 2.2 Admin 后台

```text
src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-dashboard-client.tsx
src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-trend-charts.tsx
src/app/[locale]/(admin)/admin/ai-image-dashboard/failed-tasks/page.tsx
src/app/[locale]/(admin)/admin/ai-image-dashboard/tasks/page.tsx
src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts-lazy.tsx
src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts.tsx
src/app/[locale]/(admin)/admin/ai-tasks/page.tsx
src/app/[locale]/(admin)/admin/categories/[id]/edit/page.tsx
src/app/[locale]/(admin)/admin/dashboard-client.tsx
src/app/[locale]/(admin)/admin/page.tsx
src/app/[locale]/(admin)/admin/prompts/[id]/delete/page.tsx
src/app/[locale]/(admin)/admin/prompts/[id]/edit/page.tsx
src/app/[locale]/(admin)/admin/prompts/add/page.tsx
src/app/[locale]/(admin)/admin/prompts/page.tsx
src/app/[locale]/(admin)/admin/settings/[tab]/page.tsx
src/app/[locale]/(admin)/admin/showcases/[id]/delete/page.tsx
src/app/[locale]/(admin)/admin/showcases/[id]/edit/page.tsx
src/app/[locale]/(admin)/admin/showcases/add/page.tsx
src/app/[locale]/(admin)/admin/showcases/page.tsx
src/app/[locale]/(admin)/admin/users/page.tsx
src/core/rbac/permission.ts
src/shared/blocks/admin/ai-provider-settings-card.tsx
src/shared/blocks/dashboard/main-header.tsx
src/shared/blocks/dashboard/nav.tsx
src/shared/blocks/dashboard/search.tsx
src/shared/blocks/dashboard/sidebar-header.tsx
src/shared/blocks/dashboard/sidebar-user.tsx
src/shared/lib/admin-content.ts
```

### 2.3 登录 / 注册 / OAuth / 路由

```text
src/app/[locale]/(auth)/sign-in/page.tsx
src/app/[locale]/(auth)/sign-up/page.tsx
src/app/[locale]/(oauth)/auth-callback/page.tsx
src/app/[locale]/(oauth)/auth-popup/page.tsx
src/app/[locale]/(oauth)/layout.tsx
src/core/auth/config.ts
src/core/auth/index.ts
src/middleware.ts
src/shared/blocks/common/locale-selector.tsx
src/shared/blocks/sign/sign-in-form.tsx
src/shared/blocks/sign/sign-in.tsx
src/shared/blocks/sign/sign-modal.tsx
src/shared/blocks/sign/sign-up-form.tsx
src/shared/blocks/sign/sign-up.tsx
src/shared/blocks/sign/sign-user.tsx
src/shared/blocks/sign/social-providers.tsx
src/shared/blocks/sign/verify-email.tsx
src/shared/services/settings.ts
tsconfig.json
```

### 2.4 支付 / Paypal / 依赖

```text
package.json
pnpm-lock.yaml
src/app/api/payment/callback/route.test.ts
src/extensions/payment/paypal.ts
src/extensions/payment/stripe.ts
src/shared/models/order.ts
src/shared/services/payment.ts
```

### 2.5 多语言 / 文案

```text
src/config/locale/index.ts
src/config/locale/messages/en/activity/ai-tasks.json
src/config/locale/messages/en/activity/sidebar.json
src/config/locale/messages/en/admin/ai-tasks.json
src/config/locale/messages/en/admin/dashboard.json
src/config/locale/messages/en/admin/prompts.json
src/config/locale/messages/en/admin/settings.json
src/config/locale/messages/en/admin/showcases.json
src/config/locale/messages/en/admin/sidebar.json
src/config/locale/messages/en/ai/chat.json
src/config/locale/messages/en/ai/image.json
src/config/locale/messages/en/ai/music.json
src/config/locale/messages/en/ai/video.json
src/config/locale/messages/en/common.json
src/config/locale/messages/en/landing.json
src/config/locale/messages/en/pages/blog.json
src/config/locale/messages/en/pages/create.json
src/config/locale/messages/en/pages/hairstyles.json
src/config/locale/messages/en/pages/index.json
src/config/locale/messages/en/pages/pricing.json
src/config/locale/messages/en/pages/showcases.json
src/config/locale/messages/en/pages/updates.json
src/config/locale/messages/en/settings/sidebar.json
src/config/locale/messages/zh/activity/ai-tasks.json
src/config/locale/messages/zh/activity/sidebar.json
src/config/locale/messages/zh/admin/ai-tasks.json
src/config/locale/messages/zh/admin/dashboard.json
src/config/locale/messages/zh/admin/prompts.json
src/config/locale/messages/zh/admin/settings.json
src/config/locale/messages/zh/admin/showcases.json
src/config/locale/messages/zh/admin/sidebar.json
src/config/locale/messages/zh/ai/chat.json
src/config/locale/messages/zh/ai/image.json
src/config/locale/messages/zh/ai/music.json
src/config/locale/messages/zh/ai/video.json
src/config/locale/messages/zh/common.json
src/config/locale/messages/zh/landing.json
src/config/locale/messages/zh/pages/blog.json
src/config/locale/messages/zh/pages/create.json
src/config/locale/messages/zh/pages/hairstyles.json
src/config/locale/messages/zh/pages/index.json
src/config/locale/messages/zh/pages/pricing.json
src/config/locale/messages/zh/pages/showcases.json
src/config/locale/messages/zh/settings/sidebar.json
```

### 2.6 页面 / 主题 / 内容

```text
content/docs/index.mdx
content/docs/index.zh.mdx
content/logs/v1.0.mdx
content/logs/v1.0.zh.mdx
content/logs/v2.0.mdx
content/logs/v2.0.zh.mdx
content/pages/privacy-policy.mdx
content/pages/privacy-policy.zh.mdx
content/pages/terms-of-service.mdx
content/pages/terms-of-service.zh.mdx
content/posts/what-is-xxx.mdx
content/posts/what-is-xxx.zh.mdx
src/app/[locale]/(landing)/(ai)/ai-image-generator/page.tsx
src/app/[locale]/(landing)/activity/layout.tsx
src/app/[locale]/(landing)/create/page.tsx
src/app/[locale]/(landing)/layout.tsx
src/app/[locale]/(landing)/pricing/page.tsx
src/app/[locale]/(landing)/settings/billing/page.tsx
src/app/[locale]/(landing)/settings/credits/page.tsx
src/app/[locale]/(landing)/settings/layout.tsx
src/app/[locale]/(landing)/settings/payments/page.tsx
src/app/[locale]/(landing)/settings/profile/page.tsx
src/app/[locale]/(landing)/showcases/page.tsx
src/shared/blocks/console/layout.tsx
src/themes/default/blocks/blog-detail.tsx
src/themes/default/blocks/blog.tsx
src/themes/default/blocks/cta.tsx
src/themes/default/blocks/faq.tsx
src/themes/default/blocks/features-accordion.tsx
src/themes/default/blocks/features-step.tsx
src/themes/default/blocks/features.tsx
src/themes/default/blocks/social-avatars.tsx
src/themes/default/layouts/landing.tsx
```

### 2.7 数据库 / 预制数据

```text
db/prompt_rows.sql
db/showcase_rows.sql
```

### 2.8 存储 / R2

```text
src/app/api/storage/upload-image/route.ts
src/shared/services/storage.ts
```

### 2.9 项目配置 / 文档 / 辅助文件

```text
.gitignore
README.md
eslint.config.mjs
public/preview.png
```
