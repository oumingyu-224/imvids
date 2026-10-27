# 2026 远程更新与 chatgptimage2 对比报告

生成时间：2026-05-14 10:48:07

对比来源：当前项目 `shipany-template-nano-banana`

对比目标：`../chatgptimage2`

范围：依据 `2026-remote-updates.md` 中列出的主要文件/目录。

说明：本报告只做对比和建议，没有修改目标项目。

## 总览

| 模块 | 来源文件数 | 相同 | 不同 | 目标缺失 | 建议 |
|---|---:|---:|---:|---:|---|
| AI 生图 / AI 任务 | 48 | 5 | 12 | 31 | 建议人工合并/选择性同步 |
| Admin 后台 | 57 | 25 | 19 | 13 | 建议人工合并/选择性同步 |
| 登录 / 注册 / OAuth | 14 | 1 | 9 | 4 | 建议优先处理 |
| 支付 / Paypal 订阅 | 10 | 2 | 7 | 1 | 建议人工合并/选择性同步 |
| 多语言 / 文案 | 81 | 35 | 42 | 4 | 不建议整体覆盖 |
| 页面与主题 | 82 | 34 | 40 | 8 | 不建议整体覆盖 |
| 数据库 / 预制数据 | 5 | 0 | 3 | 2 | 建议人工合并/选择性同步 |
| 存储 / R2 | 4 | 0 | 3 | 1 | 建议优先处理 |
| 项目配置 / 依赖 | 6 | 0 | 5 | 1 | 建议人工合并/选择性同步 |
| Skills / 自动化辅助 | 17 | 17 | 0 | 0 | 无需修改 |

## 分模块结果

### AI 生图 / AI 任务

- 对比结果：来源 48 个文件；相同 5；不同 12；目标缺失 31。
- 修改建议：建议人工合并/选择性同步。
- 说明：建议选择性同步。该模块更新量大，涉及前台任务、后台看板、API、模型和积分链路；如果目标项目仍使用旧生图链路，建议先同步安全/积分校验/API 查询相关文件，再评估 UI。

| 状态 | 文件 |
|---|---|
| 目标缺失 | `public/imgs/demos/reference-beach-model.jpg` |
| 目标缺失 | `public/imgs/demos/reference-vintage-photo.jpg` |
| 目标缺失 | `public/imgs/demos/result-anime-figure-showcase.jpg` |
| 目标缺失 | `public/imgs/demos/result-blue-hair.jpg` |
| 目标缺失 | `public/imgs/demos/result-crochet-doll.jpg` |
| 目标缺失 | `public/imgs/demos/result-lego-minifigure.jpg` |
| 目标缺失 | `public/imgs/demos/result-red-bikini.jpg` |
| 目标缺失 | `public/imgs/demos/result-restored-color-photo.jpg` |
| 目标缺失 | `public/imgs/demos/result-starry-night-style.jpg` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-dashboard-client.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-trend-charts.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/failed-tasks/page.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/page.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/tasks/page.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts-lazy.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-table.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/ai-tasks/page.tsx` |
| 目标缺失 | `src/app/[locale]/(landing)/activity/ai-tasks/[id]/download/download-client.tsx` |
| 目标缺失 | `src/app/[locale]/(landing)/activity/ai-tasks/[id]/download/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/activity/ai-tasks/[id]/refresh/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/activity/ai-tasks/page.tsx` |
| 目标缺失 | `src/app/api/ai/dispatch/route.ts` |
| 不同 | `src/app/api/ai/generate/route.ts` |
| 目标缺失 | `src/app/api/ai/notify/[provider]/route.ts` |
| 不同 | `src/app/api/ai/providers/route.ts` |
| 不同 | `src/app/api/ai/query/route.ts` |
| 目标缺失 | `src/app/api/ai/storage/retry-r2/route.ts` |
| 目标缺失 | `src/extensions/ai/custom.ts` |
| 不同 | `src/extensions/ai/index.ts` |
| 不同 | `src/extensions/ai/types.ts` |
| 目标缺失 | `src/shared/blocks/generator/image-generator-examples.tsx` |
| 不同 | `src/shared/blocks/generator/image.tsx` |
| 不同 | `src/shared/blocks/generator/music.tsx` |
| 不同 | `src/shared/blocks/generator/video.tsx` |
| 目标缺失 | `src/shared/lib/image-generation.ts` |
| 不同 | `src/shared/models/ai_task.ts` |
| 目标缺失 | `src/shared/services/ai_task_concurrency.test.ts` |
| 目标缺失 | `src/shared/services/ai_task_dispatch.ts` |
| 目标缺失 | `src/shared/services/ai_task_log.ts` |
| 目标缺失 | `src/shared/services/ai_task_mock.ts` |
| 目标缺失 | `src/shared/services/ai_task_showcase.ts` |
| 目标缺失 | `src/shared/services/ai_task_status.ts` |

### Admin 后台

- 对比结果：来源 57 个文件；相同 25；不同 19；目标缺失 13。
- 修改建议：建议人工合并/选择性同步。
- 说明：建议选择性同步。后台页面与目标项目定制内容可能冲突，优先同步权限、数据查询、bug 修复类文件；页面组件需人工核对业务差异。

| 状态 | 文件 |
|---|---|
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-dashboard-client.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-trend-charts.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/failed-tasks/page.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/page.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-image-dashboard/tasks/page.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts-lazy.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-table.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/ai-tasks/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/categories/[id]/edit/page.tsx` |
| 目标缺失 | `src/app/[locale]/(admin)/admin/dashboard-client.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/prompts/[id]/delete/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/prompts/[id]/edit/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/prompts/add/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/prompts/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/settings/[tab]/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/showcases/[id]/delete/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/showcases/[id]/edit/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/showcases/add/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/showcases/page.tsx` |
| 不同 | `src/app/[locale]/(admin)/admin/users/page.tsx` |
| 不同 | `src/core/rbac/permission.ts` |
| 目标缺失 | `src/shared/blocks/admin/ai-provider-settings-card.tsx` |
| 不同 | `src/shared/blocks/dashboard/main-header.tsx` |
| 不同 | `src/shared/blocks/dashboard/nav.tsx` |
| 不同 | `src/shared/blocks/dashboard/search.tsx` |
| 不同 | `src/shared/blocks/dashboard/sidebar-header.tsx` |
| 不同 | `src/shared/blocks/dashboard/sidebar-user.tsx` |
| 目标缺失 | `src/shared/lib/admin-content.ts` |
| 目标缺失 | `src/shared/services/admin-ai-image-dashboard.ts` |
| 目标缺失 | `src/shared/services/admin-dashboard.ts` |

### 登录 / 注册 / OAuth

- 对比结果：来源 14 个文件；相同 1；不同 9；目标缺失 4。
- 修改建议：建议优先处理。
- 说明：建议优先同步或人工合并。这里包含 2026-05-13 的登录/注册页配置泄露修复，以及登录状态刷新、OAuth 相关更新，属于安全和稳定性优先级较高的部分。

| 状态 | 文件 |
|---|---|
| 目标缺失 | `src/app/[locale]/(oauth)/auth-callback/page.tsx` |
| 目标缺失 | `src/app/[locale]/(oauth)/auth-popup/page.tsx` |
| 目标缺失 | `src/app/[locale]/(oauth)/layout.tsx` |
| 不同 | `src/core/auth/config.ts` |
| 不同 | `src/core/auth/index.ts` |
| 不同 | `src/shared/blocks/sign/sign-in-form.tsx` |
| 不同 | `src/shared/blocks/sign/sign-in.tsx` |
| 不同 | `src/shared/blocks/sign/sign-modal.tsx` |
| 目标缺失 | `src/shared/blocks/sign/sign-up-form.tsx` |
| 不同 | `src/shared/blocks/sign/sign-up.tsx` |
| 不同 | `src/shared/blocks/sign/sign-user.tsx` |
| 不同 | `src/shared/blocks/sign/social-providers.tsx` |
| 不同 | `src/shared/blocks/sign/verify-email.tsx` |

### 支付 / Paypal 订阅

- 对比结果：来源 10 个文件；相同 2；不同 7；目标缺失 1。
- 修改建议：建议人工合并/选择性同步。
- 说明：建议谨慎同步。支付逻辑和依赖变更风险高；如果目标项目需要 Paypal 订阅或支付修复，应逐文件合并并单独验证回调、订阅、订单状态。

| 状态 | 文件 |
|---|---|
| 不同 | `package.json` |
| 不同 | `pnpm-lock.yaml` |
| 目标缺失 | `src/app/api/payment/callback/route.test.ts` |
| 不同 | `src/app/api/payment/callback/route.ts` |
| 不同 | `src/app/api/payment/checkout/route.ts` |
| 不同 | `src/extensions/payment/paypal.ts` |
| 不同 | `src/shared/models/order.ts` |
| 不同 | `src/shared/services/payment.ts` |

### 多语言 / 文案

- 对比结果：来源 81 个文件；相同 35；不同 42；目标缺失 4。
- 修改建议：不建议整体覆盖。
- 说明：建议按功能选择性同步。目标项目通常有自己的产品文案，不能整体覆盖；只建议同步新增功能需要的 key 和明显 bug 修复。

| 状态 | 文件 |
|---|---|
| 不同 | `src/config/locale/index.ts` |
| 不同 | `src/config/locale/messages/en/activity/ai-tasks.json` |
| 不同 | `src/config/locale/messages/en/activity/sidebar.json` |
| 不同 | `src/config/locale/messages/en/admin/ai-tasks.json` |
| 目标缺失 | `src/config/locale/messages/en/admin/dashboard.json` |
| 不同 | `src/config/locale/messages/en/admin/prompts.json` |
| 不同 | `src/config/locale/messages/en/admin/settings.json` |
| 不同 | `src/config/locale/messages/en/admin/showcases.json` |
| 不同 | `src/config/locale/messages/en/admin/sidebar.json` |
| 不同 | `src/config/locale/messages/en/ai/chat.json` |
| 不同 | `src/config/locale/messages/en/ai/image.json` |
| 不同 | `src/config/locale/messages/en/ai/music.json` |
| 不同 | `src/config/locale/messages/en/ai/video.json` |
| 不同 | `src/config/locale/messages/en/common.json` |
| 不同 | `src/config/locale/messages/en/landing.json` |
| 不同 | `src/config/locale/messages/en/pages/blog.json` |
| 不同 | `src/config/locale/messages/en/pages/create.json` |
| 不同 | `src/config/locale/messages/en/pages/hairstyles.json` |
| 不同 | `src/config/locale/messages/en/pages/index.json` |
| 不同 | `src/config/locale/messages/en/pages/pricing.json` |
| 目标缺失 | `src/config/locale/messages/en/pages/prompts.json` |
| 不同 | `src/config/locale/messages/en/pages/showcases.json` |
| 不同 | `src/config/locale/messages/en/pages/updates.json` |
| 不同 | `src/config/locale/messages/en/settings/sidebar.json` |
| 不同 | `src/config/locale/messages/zh/activity/ai-tasks.json` |
| 不同 | `src/config/locale/messages/zh/activity/sidebar.json` |
| 不同 | `src/config/locale/messages/zh/admin/ai-tasks.json` |
| 目标缺失 | `src/config/locale/messages/zh/admin/dashboard.json` |
| 不同 | `src/config/locale/messages/zh/admin/prompts.json` |
| 不同 | `src/config/locale/messages/zh/admin/settings.json` |
| 不同 | `src/config/locale/messages/zh/admin/showcases.json` |
| 不同 | `src/config/locale/messages/zh/admin/sidebar.json` |
| 不同 | `src/config/locale/messages/zh/ai/chat.json` |
| 不同 | `src/config/locale/messages/zh/ai/image.json` |
| 不同 | `src/config/locale/messages/zh/ai/music.json` |
| 不同 | `src/config/locale/messages/zh/ai/video.json` |
| 不同 | `src/config/locale/messages/zh/common.json` |
| 不同 | `src/config/locale/messages/zh/landing.json` |
| 不同 | `src/config/locale/messages/zh/pages/blog.json` |
| 不同 | `src/config/locale/messages/zh/pages/create.json` |
| 不同 | `src/config/locale/messages/zh/pages/hairstyles.json` |
| 不同 | `src/config/locale/messages/zh/pages/index.json` |
| 不同 | `src/config/locale/messages/zh/pages/pricing.json` |
| 目标缺失 | `src/config/locale/messages/zh/pages/prompts.json` |
| 不同 | `src/config/locale/messages/zh/pages/showcases.json` |
| 不同 | `src/config/locale/messages/zh/settings/sidebar.json` |

### 页面与主题

- 对比结果：来源 82 个文件；相同 34；不同 40；目标缺失 8。
- 修改建议：不建议整体覆盖。
- 说明：不建议整体覆盖。目标项目的 landing、内容和主题通常定制较多；建议只提取明确 bug 修复，例如 pricing、滚动条、结构化数据等。

| 状态 | 文件 |
|---|---|
| 不同 | `content/docs/index.mdx` |
| 不同 | `content/docs/index.zh.mdx` |
| 目标缺失 | `content/logs/v1.0.mdx` |
| 目标缺失 | `content/logs/v1.0.zh.mdx` |
| 目标缺失 | `content/logs/v2.0.mdx` |
| 目标缺失 | `content/logs/v2.0.zh.mdx` |
| 不同 | `content/pages/privacy-policy.mdx` |
| 不同 | `content/pages/privacy-policy.zh.mdx` |
| 不同 | `content/pages/terms-of-service.mdx` |
| 不同 | `content/pages/terms-of-service.zh.mdx` |
| 不同 | `content/posts/what-is-xxx.mdx` |
| 不同 | `content/posts/what-is-xxx.zh.mdx` |
| 不同 | `src/app/[locale]/(landing)/(ai)/ai-image-generator/page.tsx` |
| 目标缺失 | `src/app/[locale]/(landing)/activity/ai-tasks/[id]/download/download-client.tsx` |
| 目标缺失 | `src/app/[locale]/(landing)/activity/ai-tasks/[id]/download/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/activity/ai-tasks/[id]/refresh/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/activity/ai-tasks/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/activity/layout.tsx` |
| 不同 | `src/app/[locale]/(landing)/create/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/layout.tsx` |
| 不同 | `src/app/[locale]/(landing)/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/pricing/page.tsx` |
| 目标缺失 | `src/app/[locale]/(landing)/prompts/page.tsx` |
| 目标缺失 | `src/app/[locale]/(landing)/prompts/prompts-content.tsx` |
| 不同 | `src/app/[locale]/(landing)/settings/billing/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/settings/credits/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/settings/layout.tsx` |
| 不同 | `src/app/[locale]/(landing)/settings/payments/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/settings/profile/page.tsx` |
| 不同 | `src/app/[locale]/(landing)/showcases/page.tsx` |
| 不同 | `src/config/style/global.css` |
| 不同 | `src/config/style/theme.css` |
| 不同 | `src/themes/default/blocks/blog-detail.tsx` |
| 不同 | `src/themes/default/blocks/blog.tsx` |
| 不同 | `src/themes/default/blocks/cta.tsx` |
| 不同 | `src/themes/default/blocks/faq.tsx` |
| 不同 | `src/themes/default/blocks/features-accordion.tsx` |
| 不同 | `src/themes/default/blocks/features-step.tsx` |
| 不同 | `src/themes/default/blocks/features.tsx` |
| 不同 | `src/themes/default/blocks/footer.tsx` |
| 不同 | `src/themes/default/blocks/header.tsx` |
| 不同 | `src/themes/default/blocks/hero.tsx` |
| 不同 | `src/themes/default/blocks/pricing.tsx` |
| 不同 | `src/themes/default/blocks/showcases-flow-dynamic.tsx` |
| 不同 | `src/themes/default/blocks/showcases-flow.tsx` |
| 不同 | `src/themes/default/blocks/social-avatars.tsx` |
| 不同 | `src/themes/default/blocks/testimonials.tsx` |
| 不同 | `src/themes/default/layouts/landing.tsx` |

### 数据库 / 预制数据

- 对比结果：来源 5 个文件；相同 0；不同 3；目标缺失 2。
- 修改建议：建议人工合并/选择性同步。
- 说明：建议谨慎同步。schema 变更需要和目标项目数据库迁移历史对应；预制 SQL 可参考，不建议直接覆盖执行。

| 状态 | 文件 |
|---|---|
| 目标缺失 | `db/prompt_rows.sql` |
| 目标缺失 | `db/showcase_rows.sql` |
| 不同 | `src/config/db/schema.mysql.ts` |
| 不同 | `src/config/db/schema.postgres.ts` |
| 不同 | `src/config/db/schema.sqlite.ts` |

### 存储 / R2

- 对比结果：来源 4 个文件；相同 0；不同 3；目标缺失 1。
- 修改建议：建议优先处理。
- 说明：建议同步配置修复。R2 endpoint/account 配置修正和上传重试链路属于稳定性更新；若目标项目使用 R2，建议人工合并。

| 状态 | 文件 |
|---|---|
| 目标缺失 | `src/app/api/ai/storage/retry-r2/route.ts` |
| 不同 | `src/app/api/storage/upload-image/route.ts` |
| 不同 | `src/extensions/storage/r2.ts` |
| 不同 | `src/shared/services/storage.ts` |

### 项目配置 / 依赖

- 对比结果：来源 6 个文件；相同 0；不同 5；目标缺失 1。
- 修改建议：建议人工合并/选择性同步。
- 说明：建议逐项检查，不建议一次性覆盖。依赖和构建配置会影响整个项目；安全漏洞相关依赖可以优先同步。

| 状态 | 文件 |
|---|---|
| 不同 | `.gitignore` |
| 目标缺失 | `eslint.config.mjs` |
| 不同 | `next.config.mjs` |
| 不同 | `package.json` |
| 不同 | `pnpm-lock.yaml` |
| 不同 | `tsconfig.json` |

### Skills / 自动化辅助

- 对比结果：来源 17 个文件；相同 17；不同 0；目标缺失 0。
- 修改建议：无需修改。
- 说明：可选同步。仅影响辅助工作流，不影响线上功能；如果目标项目需要同样的 Claude skills，可直接参考同步。

未发现差异。

## 优先建议清单

| 优先级 | 文件 | 当前状态 | 建议 |
|---|---|---|---|
| 高 | `src/app/[locale]/(auth)/sign-in/page.tsx` | 不同 | 建议优先人工合并，涉及登录/注册页配置泄露修复 |
| 高 | `src/app/[locale]/(auth)/sign-up/page.tsx` | 不同 | 建议优先人工合并，涉及登录/注册页配置泄露修复 |
| 高 | `src/shared/services/settings.ts` | 不同 | 建议优先人工合并，涉及登录/注册页配置泄露修复 |
| 中 | `src/extensions/storage/r2.ts` | 不同 | 建议按功能人工合并 |
| 中 | `src/shared/services/storage.ts` | 不同 | 建议按功能人工合并 |
| 中 | `src/app/api/ai/generate/route.ts` | 不同 | 建议按功能人工合并 |
| 中 | `src/app/api/ai/query/route.ts` | 不同 | 建议按功能人工合并 |
| 中 | `src/shared/services/ai_task_dispatch.ts` | 目标缺失 | 建议按功能人工合并 |
| 中 | `src/shared/services/ai_task_status.ts` | 目标缺失 | 建议按功能人工合并 |
| 中 | `src/shared/lib/image-generation.ts` | 目标缺失 | 建议按功能人工合并 |
| 中 | `package.json` | 不同 | 建议检查依赖安全更新，避免直接覆盖业务依赖 |
| 中 | `pnpm-lock.yaml` | 不同 | 建议检查依赖安全更新，避免直接覆盖业务依赖 |

## 结论

1. 不建议把当前项目整体覆盖到 `chatgptimage2`，因为目标项目存在大量自定义页面、文案和业务文件。
2. 建议优先处理安全和稳定性更新：登录/注册配置泄露修复、OAuth/登录状态、R2 存储、AI 任务状态和积分链路。
3. 页面、主题、多语言文案建议只同步必要 key 或 bug fix，不建议整体替换。
4. 支付和数据库 schema 变更必须人工核对目标项目现有业务和迁移历史。