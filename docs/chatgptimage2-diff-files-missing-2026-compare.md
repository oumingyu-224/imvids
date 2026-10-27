# chatgptimage2-diff-files 缺失 2026 信息对比报告

对比依据：`chatgptimage2-diff-analysis-missing-2026.md` 第 2 部分列出的 158 个文件路径。

对比来源：`chatgptimage2-diff-files/`

对比目标：当前项目同路径文件。

说明：本报告只记录存在状态与内容差异摘要；没有修改业务文件。

## 总览

| 状态 | 数量 |
|---|---:|
| 两边都有，内容不同 | 112 |
| 项目缺失 | 37 |
| diff-files 缺失 | 7 |
| 两边都缺失 | 2 |

## 按模块统计

| 模块 | 总数 | 两边都有，内容不同 | 项目缺失 | diff-files 缺失 | 两边都缺失 | 其它 |
|---|---:|---:|---:|---:|---:|---:|
| 2.1 AI 生图 / AI 任务 | 19 | 5 | 14 | 0 | 0 | 0 |
| 2.2 Admin 后台 | 28 | 19 | 9 | 0 | 0 | 0 |
| 2.3 登录 / 注册 / OAuth / 路由 | 19 | 10 | 4 | 4 | 1 | 0 |
| 2.4 支付 / Paypal / 依赖 | 7 | 5 | 1 | 1 | 0 | 0 |
| 2.5 多语言 / 文案 | 44 | 42 | 2 | 0 | 0 | 0 |
| 2.6 页面 / 主题 / 内容 | 33 | 28 | 4 | 1 | 0 | 0 |
| 2.7 数据库 / 预制数据 | 2 | 0 | 2 | 0 | 0 | 0 |
| 2.8 存储 / R2 | 2 | 2 | 0 | 0 | 0 | 0 |
| 2.9 项目配置 / 文档 / 辅助文件 | 4 | 1 | 1 | 1 | 1 | 0 |

## 逐文件结果

### 2.1 AI 生图 / AI 任务

| 文件 | 状态 | 差异摘要 |
|---|---|---|
| `public/imgs/demos/reference-beach-model.jpg` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=64068 |
| `public/imgs/demos/reference-vintage-photo.jpg` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=51798 |
| `public/imgs/demos/result-anime-figure-showcase.jpg` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=72543 |
| `public/imgs/demos/result-blue-hair.jpg` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=66197 |
| `public/imgs/demos/result-crochet-doll.jpg` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=135447 |
| `public/imgs/demos/result-lego-minifigure.jpg` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=72980 |
| `public/imgs/demos/result-red-bikini.jpg` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=106151 |
| `public/imgs/demos/result-restored-color-photo.jpg` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=69857 |
| `public/imgs/demos/result-starry-night-style.jpg` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=205365 |
| `src/app/api/ai/providers/route.ts` | 两边都有，内容不同 | 文本不同：diff-files 45 行，项目 46 行；相对项目 +16/-17 行，变更块 4 个；import 差异：diff-files 独有 1 项，项目独有 0 项；声明差异：diff-files 独有 2 个，项目独有 0 个；关键词计数 diff-files/项目：token:0/1，provider:14/10 |
| `src/app/api/ai/storage/retry-r2/route.ts` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=829 |
| `src/extensions/ai/custom.ts` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=4058 |
| `src/extensions/ai/index.ts` | 两边都有，内容不同 | 文本不同：diff-files 81 行，项目 80 行；相对项目 +1/-0 行，变更块 1 个 |
| `src/extensions/ai/types.ts` | 两边都有，内容不同 | 文本不同：diff-files 129 行，项目 128 行；相对项目 +1/-0 行，变更块 1 个 |
| `src/shared/blocks/generator/music.tsx` | 两边都有，内容不同 | 文本不同：diff-files 816 行，项目 782 行；相对项目 +53/-19 行，变更块 19 个；import 差异：diff-files 独有 3 项，项目独有 1 项；声明差异：diff-files 独有 2 个，项目独有 0 个；关键词计数 diff-files/项目：callback:2/0，credits:36/35，prompt:17/16 |
| `src/shared/blocks/generator/video.tsx` | 两边都有，内容不同 | 文本不同：diff-files 936 行，项目 907 行；相对项目 +48/-19 行，变更块 22 个；import 差异：diff-files 独有 2 项，项目独有 0 项；声明差异：diff-files 独有 1 个，项目独有 0 个；关键词计数 diff-files/项目：credits:43/42，provider:33/34，prompt:36/34 |
| `src/shared/services/ai_task_concurrency.test.ts` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=5611 |
| `src/shared/services/ai_task_mock.ts` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=2529 |
| `src/shared/services/ai_task_showcase.ts` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=5144 |

### 2.2 Admin 后台

| 文件 | 状态 | 差异摘要 |
|---|---|---|
| `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-dashboard-client.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=3543 |
| `src/app/[locale]/(admin)/admin/ai-image-dashboard/ai-image-trend-charts.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=5709 |
| `src/app/[locale]/(admin)/admin/ai-image-dashboard/failed-tasks/page.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=1683 |
| `src/app/[locale]/(admin)/admin/ai-image-dashboard/tasks/page.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=1582 |
| `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts-lazy.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=433 |
| `src/app/[locale]/(admin)/admin/ai-tasks/ai-tasks-overview-charts.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=2765 |
| `src/app/[locale]/(admin)/admin/ai-tasks/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 110 行，项目 122 行；相对项目 +32/-44 行，变更块 12 个；import 差异：diff-files 独有 3 项，项目独有 3 项；声明差异：diff-files 独有 0 个，项目独有 3 个；关键词计数 diff-files/项目：credits:0/2，provider:0/2，prompt:0/2 |
| `src/app/[locale]/(admin)/admin/categories/[id]/edit/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 130 行，项目 130 行；相对项目 +1/-1 行，变更块 1 个 |
| `src/app/[locale]/(admin)/admin/dashboard-client.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=7624 |
| `src/app/[locale]/(admin)/admin/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 37 行，项目 11 行；相对项目 +28/-2 行，变更块 3 个；import 差异：diff-files 独有 5 项，项目独有 1 项；声明差异：diff-files 独有 3 个，项目独有 0 个；关键词计数 diff-files/项目：locale:5/3，admin:9/2 |
| `src/app/[locale]/(admin)/admin/prompts/[id]/delete/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 80 行，项目 34 行；相对项目 +53/-7 行，变更块 7 个；import 差异：diff-files 独有 7 项，项目独有 2 项；声明差异：diff-files 独有 5 个，项目独有 0 个；关键词计数 diff-files/项目：admin:9/3，prompt:23/11 |
| `src/app/[locale]/(admin)/admin/prompts/[id]/edit/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 128 行，项目 134 行；相对项目 +28/-34 行，变更块 20 个；import 差异：diff-files 独有 2 项，项目独有 1 项；声明差异：diff-files 独有 2 个，项目独有 2 个；关键词计数 diff-files/项目：admin:7/6，showcase:0/1，prompt:45/41 |
| `src/app/[locale]/(admin)/admin/prompts/add/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 118 行，项目 124 行；相对项目 +26/-32 行，变更块 18 个；import 差异：diff-files 独有 2 项，项目独有 1 项；声明差异：diff-files 独有 2 个，项目独有 2 个；关键词计数 diff-files/项目：admin:7/6，showcase:0/1，prompt:37/31 |
| `src/app/[locale]/(admin)/admin/prompts/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 149 行，项目 133 行；相对项目 +57/-41 行，变更块 20 个；import 差异：diff-files 独有 4 项，项目独有 2 项；声明差异：diff-files 独有 3 个，项目独有 1 个；关键词计数 diff-files/项目：callback:4/3，admin:10/8，prompt:29/23 |
| `src/app/[locale]/(admin)/admin/settings/[tab]/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 192 行，项目 122 行；相对项目 +84/-14 行，变更块 8 个；import 差异：diff-files 独有 2 项，项目独有 0 项；声明差异：diff-files 独有 4 个，项目独有 0 个；关键词计数 diff-files/项目：credits:1/0，provider:9/1，locale:7/6，admin:6/4 |
| `src/app/[locale]/(admin)/admin/showcases/[id]/delete/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 80 行，项目 35 行；相对项目 +52/-7 行，变更块 7 个；import 差异：diff-files 独有 7 项，项目独有 2 项；声明差异：diff-files 独有 5 个，项目独有 0 个；关键词计数 diff-files/项目：admin:9/4，showcase:22/12 |
| `src/app/[locale]/(admin)/admin/showcases/[id]/edit/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 124 行，项目 130 行；相对项目 +5/-11 行，变更块 6 个；import 差异：diff-files 独有 2 项，项目独有 1 项；声明差异：diff-files 独有 0 个，项目独有 1 个；关键词计数 diff-files/项目：admin:7/6，showcase:21/19 |
| `src/app/[locale]/(admin)/admin/showcases/add/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 119 行，项目 124 行；相对项目 +5/-10 行，变更块 6 个；import 差异：diff-files 独有 2 项，项目独有 1 项；声明差异：diff-files 独有 0 个，项目独有 1 个；关键词计数 diff-files/项目：admin:7/6，showcase:16/14 |
| `src/app/[locale]/(admin)/admin/showcases/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 163 行，项目 126 行；相对项目 +68/-31 行，变更块 14 个；import 差异：diff-files 独有 6 项，项目独有 3 项；声明差异：diff-files 独有 3 个，项目独有 1 个；关键词计数 diff-files/项目：callback:6/3，admin:10/8，showcase:24/16，prompt:7/3 |
| `src/app/[locale]/(admin)/admin/users/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 141 行，项目 147 行；相对项目 +0/-6 行，变更块 1 个；关键词计数 diff-files/项目：credits:6/9，admin:7/8 |
| `src/core/rbac/permission.ts` | 两边都有，内容不同 | 文本不同：diff-files 349 行，项目 339 行；相对项目 +10/-0 行，变更块 1 个；关键词计数 diff-files/项目：admin:42/36，showcase:7/0，prompt:7/0 |
| `src/shared/blocks/admin/ai-provider-settings-card.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=8449 |
| `src/shared/blocks/dashboard/main-header.tsx` | 两边都有，内容不同 | 文本不同：diff-files 63 行，项目 69 行；相对项目 +1/-7 行，变更块 2 个；import 差异：diff-files 独有 0 项，项目独有 1 项 |
| `src/shared/blocks/dashboard/nav.tsx` | 两边都有，内容不同 | 文本不同：diff-files 184 行，项目 127 行；相对项目 +84/-27 行，变更块 9 个；import 差异：diff-files 独有 2 项，项目独有 1 项；声明差异：diff-files 独有 5 个，项目独有 1 个；关键词计数 diff-files/项目：admin:2/0 |
| `src/shared/blocks/dashboard/search.tsx` | 两边都有，内容不同 | 文本不同：diff-files 237 行，项目 56 行；相对项目 +201/-20 行，变更块 11 个；import 差异：diff-files 独有 7 项，项目独有 3 项；声明差异：diff-files 独有 14 个，项目独有 0 个；关键词计数 diff-files/项目：R2:3/0 |
| `src/shared/blocks/dashboard/sidebar-header.tsx` | 两边都有，内容不同 | 文本不同：diff-files 56 行，项目 55 行；相对项目 +1/-0 行，变更块 1 个 |
| `src/shared/blocks/dashboard/sidebar-user.tsx` | 两边都有，内容不同 | 文本不同：diff-files 241 行，项目 241 行；相对项目 +2/-2 行，变更块 2 个；import 差异：diff-files 独有 1 项，项目独有 1 项 |
| `src/shared/lib/admin-content.ts` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=1747 |

### 2.3 登录 / 注册 / OAuth / 路由

| 文件 | 状态 | 差异摘要 |
|---|---|---|
| `src/app/[locale]/(auth)/sign-in/page.tsx` | diff-files 缺失 | 项目中存在，diff-files 同路径不存在；项目类型=文件；大小=971 |
| `src/app/[locale]/(auth)/sign-up/page.tsx` | diff-files 缺失 | 项目中存在，diff-files 同路径不存在；项目类型=文件；大小=971 |
| `src/app/[locale]/(oauth)/auth-callback/page.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=964 |
| `src/app/[locale]/(oauth)/auth-popup/page.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=833 |
| `src/app/[locale]/(oauth)/layout.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=208 |
| `src/core/auth/config.ts` | 两边都有，内容不同 | 文本不同：diff-files 252 行，项目 261 行；相对项目 +99/-108 行，变更块 8 个；import 差异：diff-files 独有 0 项，项目独有 2 项；声明差异：diff-files 独有 5 个，项目独有 2 个；关键词计数 diff-files/项目：credits:4/2，signUp:1/0，signIn:3/5，locale:16/7 |
| `src/core/auth/index.ts` | 两边都有，内容不同 | 文本不同：diff-files 15 行，项目 17 行；相对项目 +0/-2 行，变更块 1 个；import 差异：diff-files 独有 0 项，项目独有 1 项 |
| `src/middleware.ts` | 两边都缺失 | diff-files 与项目同路径都不存在 |
| `src/shared/blocks/common/locale-selector.tsx` | diff-files 缺失 | 项目中存在，diff-files 同路径不存在；项目类型=文件；大小=3352 |
| `src/shared/blocks/sign/sign-in-form.tsx` | 两边都有，内容不同 | 文本不同：diff-files 226 行，项目 205 行；相对项目 +30/-9 行，变更块 9 个；声明差异：diff-files 独有 2 个，项目独有 0 个；关键词计数 diff-files/项目：signUp:4/0 |
| `src/shared/blocks/sign/sign-in.tsx` | 两边都有，内容不同 | 文本不同：diff-files 231 行，项目 294 行；相对项目 +20/-83 行，变更块 22 个；import 差异：diff-files 独有 3 项，项目独有 3 项；声明差异：diff-files 独有 0 个，项目独有 6 个；关键词计数 diff-files/项目：callback:20/24，R2:2/0，signIn:5/6 |
| `src/shared/blocks/sign/sign-modal.tsx` | 两边都有，内容不同 | 文本不同：diff-files 103 行，项目 63 行；相对项目 +48/-8 行，变更块 10 个；import 差异：diff-files 独有 2 项，项目独有 0 项；声明差异：diff-files 独有 4 个，项目独有 0 个；关键词计数 diff-files/项目：callback:10/6，signUp:5/0，signIn:5/3 |
| `src/shared/blocks/sign/sign-up-form.tsx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=7099 |
| `src/shared/blocks/sign/sign-up.tsx` | 两边都有，内容不同 | 文本不同：diff-files 256 行，项目 256 行；相对项目 +4/-4 行，变更块 4 个 |
| `src/shared/blocks/sign/sign-user.tsx` | 两边都有，内容不同 | 文本不同：diff-files 269 行，项目 455 行；相对项目 +157/-343 行，变更块 25 个；import 差异：diff-files 独有 6 项，项目独有 3 项；声明差异：diff-files 独有 6 个，项目独有 42 个；关键词计数 diff-files/项目：credits:6/16，signUp:0/6，signIn:0/3，admin:3/5 |
| `src/shared/blocks/sign/social-providers.tsx` | 两边都有，内容不同 | 文本不同：diff-files 167 行，项目 109 行；相对项目 +81/-23 行，变更块 9 个；import 差异：diff-files 独有 1 项，项目独有 1 项；声明差异：diff-files 独有 12 个，项目独有 1 个；关键词计数 diff-files/项目：callback:17/9，provider:19/16，storage:7/0，signIn:6/5，OAuth:1/0，locale:12/9 |
| `src/shared/blocks/sign/verify-email.tsx` | 两边都有，内容不同 | 文本不同：diff-files 356 行，项目 356 行；相对项目 +13/-13 行，变更块 9 个；import 差异：diff-files 独有 1 项，项目独有 1 项；关键词计数 diff-files/项目：callback:16/12 |
| `src/shared/services/settings.ts` | diff-files 缺失 | 项目中存在，diff-files 同路径不存在；项目类型=文件；大小=25888 |
| `tsconfig.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 0 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：无；值不同 key 一级分布：无 |

### 2.4 支付 / Paypal / 依赖

| 文件 | 状态 | 差异摘要 |
|---|---|---|
| `package.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 2 个，项目独有 key 9 个，共同 key 值不同 1 个；diff-files 独有 key 一级分布：devDependencies:1, scripts:1；项目独有 key 一级分布：engines:1, packageManager:1, pnpm:5, scripts:2；值不同 key 一级分布：scripts:1 |
| `pnpm-lock.yaml` | 两边都有，内容不同 | 文本不同：diff-files 12938 行，项目 12971 行；相对项目 +129/-162 行，变更块 137 个 |
| `src/app/api/payment/callback/route.test.ts` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=3569 |
| `src/extensions/payment/paypal.ts` | 两边都有，内容不同 | 文本不同：diff-files 1218 行，项目 1222 行；相对项目 +0/-4 行，变更块 1 个 |
| `src/extensions/payment/stripe.ts` | diff-files 缺失 | 项目中存在，diff-files 同路径不存在；项目类型=文件；大小=18167 |
| `src/shared/models/order.ts` | 两边都有，内容不同 | 文本不同：diff-files 445 行，项目 420 行；相对项目 +52/-27 行，变更块 4 个 |
| `src/shared/services/payment.ts` | 两边都有，内容不同 | 文本不同：diff-files 581 行，项目 582 行；相对项目 +1/-2 行，变更块 1 个；import 差异：diff-files 独有 1 项，项目独有 2 项 |

### 2.5 多语言 / 文案

| 文件 | 状态 | 差异摘要 |
|---|---|---|
| `src/config/locale/index.ts` | 两边都有，内容不同 | 文本不同：diff-files 57 行，项目 61 行；相对项目 +2/-6 行，变更块 6 个；关键词计数 diff-files/项目：credits:1/2，admin:14/15，prompt:2/1 |
| `src/config/locale/messages/en/activity/ai-tasks.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 18 个，项目独有 key 0 个，共同 key 值不同 1 个；diff-files 独有 key 一级分布：list:5, messages:13；项目独有 key 一级分布：无；值不同 key 一级分布：list:1 |
| `src/config/locale/messages/en/activity/sidebar.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 0 个，共同 key 值不同 4 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：无；值不同 key 一级分布：nav:1, title:1, top_nav:2 |
| `src/config/locale/messages/en/admin/ai-tasks.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 34 个，项目独有 key 0 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：board:14, charts:5, fields:5, list:10；项目独有 key 一级分布：无；值不同 key 一级分布：无 |
| `src/config/locale/messages/en/admin/dashboard.json` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=1211 |
| `src/config/locale/messages/en/admin/prompts.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 11 个，项目独有 key 0 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：confirm_delete:5, empty:1, feedback:2, list:2, tips:1；项目独有 key 一级分布：无；值不同 key 一级分布：无 |
| `src/config/locale/messages/en/admin/settings.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 105 个，项目独有 key 2 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：ai_table:12, edit:3, groups:2, payment:88；项目独有 key 一级分布：edit:1, groups:1；值不同 key 一级分布：无 |
| `src/config/locale/messages/en/admin/showcases.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 10 个，项目独有 key 0 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：confirm_delete:5, form:3, search:2；项目独有 key 一级分布：无；值不同 key 一级分布：无 |
| `src/config/locale/messages/en/admin/sidebar.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 7 个，项目独有 key 4 个，共同 key 值不同 6 个；diff-files 独有 key 一级分布：main_navs:7；项目独有 key 一级分布：main_navs:4；值不同 key 一级分布：footer:1, header:2, main_navs:3 |
| `src/config/locale/messages/en/ai/chat.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 4 个，项目独有 key 0 个，共同 key 值不同 3 个；diff-files 独有 key 一级分布：generator:4；项目独有 key 一级分布：无；值不同 key 一级分布：sidebar:3 |
| `src/config/locale/messages/en/ai/image.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 65 个，项目独有 key 53 个，共同 key 值不同 6 个；diff-files 独有 key 一级分布：generator:60, page:5；项目独有 key 一级分布：generator:53；值不同 key 一级分布：generator:5, metadata:1 |
| `src/config/locale/messages/en/ai/music.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 15 个，项目独有 key 0 个，共同 key 值不同 1 个；diff-files 独有 key 一级分布：generator:15；项目独有 key 一级分布：无；值不同 key 一级分布：metadata:1 |
| `src/config/locale/messages/en/ai/video.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 20 个，项目独有 key 0 个，共同 key 值不同 1 个；diff-files 独有 key 一级分布：generator:20；项目独有 key 一级分布：无；值不同 key 一级分布：metadata:1 |
| `src/config/locale/messages/en/common.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 34 个，项目独有 key 10 个，共同 key 值不同 5 个；diff-files 独有 key 一级分布：actions:3, messages:1, metadata:1, not_found:2, payment:24, sign:3；项目独有 key 一级分布：sign:10；值不同 key 一级分布：metadata:2, sign:3 |
| `src/config/locale/messages/en/landing.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 22 个，项目独有 key 97 个，共同 key 值不同 86 个；diff-files 独有 key 一级分布：footer:13, header:7, testimonials:1, usage:1；项目独有 key 一级分布：faq:2, footer:7, header:18, hero:3, testimonials:43, usage:24；值不同 key 一级分布：cta:4, faq:13, features:14, footer:11, header:6, hero:6, showcases-flow:32 |
| `src/config/locale/messages/en/pages/blog.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 0 个，共同 key 值不同 3 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：无；值不同 key 一级分布：blog:1, metadata:1, page:1 |
| `src/config/locale/messages/en/pages/create.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 0 个，共同 key 值不同 8 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：无；值不同 key 一级分布：generator:4, metadata:2, page:2 |
| `src/config/locale/messages/en/pages/hairstyles.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 0 个，共同 key 值不同 4 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：无；值不同 key 一级分布：metadata:2, page:1, showcases-flow:1 |
| `src/config/locale/messages/en/pages/index.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 15 个，项目独有 key 34 个，共同 key 值不同 100 个；diff-files 独有 key 一级分布：page:15；项目独有 key 一级分布：page:34；值不同 key 一级分布：page:100 |
| `src/config/locale/messages/en/pages/pricing.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 79 个，项目独有 key 255 个，共同 key 值不同 5 个；diff-files 独有 key 一级分布：page:79；项目独有 key 一级分布：pricing:255；值不同 key 一级分布：metadata:2, page:3 |
| `src/config/locale/messages/en/pages/showcases.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 1 个，项目独有 key 68 个，共同 key 值不同 25 个；diff-files 独有 key 一级分布：ui:1；项目独有 key 一级分布：page:63, ui:5；值不同 key 一级分布：metadata:2, page:2, showcases-flow:21 |
| `src/config/locale/messages/en/pages/updates.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 0 个，共同 key 值不同 1 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：无；值不同 key 一级分布：metadata:1 |
| `src/config/locale/messages/en/settings/sidebar.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 3 个，共同 key 值不同 3 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：nav:3；值不同 key 一级分布：nav:1, top_nav:2 |
| `src/config/locale/messages/zh/activity/ai-tasks.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 18 个，项目独有 key 0 个，共同 key 值不同 1 个；diff-files 独有 key 一级分布：list:5, messages:13；项目独有 key 一级分布：无；值不同 key 一级分布：list:1 |
| `src/config/locale/messages/zh/activity/sidebar.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 0 个，共同 key 值不同 4 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：无；值不同 key 一级分布：nav:1, title:1, top_nav:2 |
| `src/config/locale/messages/zh/admin/ai-tasks.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 34 个，项目独有 key 0 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：board:14, charts:5, fields:5, list:10；项目独有 key 一级分布：无；值不同 key 一级分布：无 |
| `src/config/locale/messages/zh/admin/dashboard.json` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=1262 |
| `src/config/locale/messages/zh/admin/prompts.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 11 个，项目独有 key 0 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：confirm_delete:5, empty:1, feedback:2, list:2, tips:1；项目独有 key 一级分布：无；值不同 key 一级分布：无 |
| `src/config/locale/messages/zh/admin/settings.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 105 个，项目独有 key 2 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：ai_table:12, edit:3, groups:2, payment:88；项目独有 key 一级分布：edit:1, groups:1；值不同 key 一级分布：无 |
| `src/config/locale/messages/zh/admin/showcases.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 10 个，项目独有 key 0 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：confirm_delete:5, form:3, search:2；项目独有 key 一级分布：无；值不同 key 一级分布：无 |
| `src/config/locale/messages/zh/admin/sidebar.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 7 个，项目独有 key 4 个，共同 key 值不同 7 个；diff-files 独有 key 一级分布：main_navs:7；项目独有 key 一级分布：main_navs:4；值不同 key 一级分布：footer:1, header:2, main_navs:4 |
| `src/config/locale/messages/zh/ai/chat.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 4 个，项目独有 key 0 个，共同 key 值不同 3 个；diff-files 独有 key 一级分布：generator:4；项目独有 key 一级分布：无；值不同 key 一级分布：sidebar:3 |
| `src/config/locale/messages/zh/ai/image.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 65 个，项目独有 key 53 个，共同 key 值不同 6 个；diff-files 独有 key 一级分布：generator:60, page:5；项目独有 key 一级分布：generator:53；值不同 key 一级分布：generator:6 |
| `src/config/locale/messages/zh/ai/music.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 15 个，项目独有 key 0 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：generator:15；项目独有 key 一级分布：无；值不同 key 一级分布：无 |
| `src/config/locale/messages/zh/ai/video.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 20 个，项目独有 key 0 个，共同 key 值不同 0 个；diff-files 独有 key 一级分布：generator:20；项目独有 key 一级分布：无；值不同 key 一级分布：无 |
| `src/config/locale/messages/zh/common.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 34 个，项目独有 key 10 个，共同 key 值不同 6 个；diff-files 独有 key 一级分布：actions:3, messages:1, metadata:1, not_found:2, payment:24, sign:3；项目独有 key 一级分布：sign:10；值不同 key 一级分布：metadata:2, sign:4 |
| `src/config/locale/messages/zh/landing.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 25 个，项目独有 key 97 个，共同 key 值不同 86 个；diff-files 独有 key 一级分布：footer:16, header:7, testimonials:1, usage:1；项目独有 key 一级分布：faq:2, footer:7, header:18, hero:3, testimonials:43, usage:24；值不同 key 一级分布：cta:4, faq:13, features:14, footer:12, header:7, hero:4, showcases-flow:32 |
| `src/config/locale/messages/zh/pages/blog.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 0 个，共同 key 值不同 2 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：无；值不同 key 一级分布：blog:1, page:1 |
| `src/config/locale/messages/zh/pages/create.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 0 个，共同 key 值不同 8 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：无；值不同 key 一级分布：generator:4, metadata:2, page:2 |
| `src/config/locale/messages/zh/pages/hairstyles.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 0 个，共同 key 值不同 4 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：无；值不同 key 一级分布：metadata:2, page:1, showcases-flow:1 |
| `src/config/locale/messages/zh/pages/index.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 15 个，项目独有 key 34 个，共同 key 值不同 100 个；diff-files 独有 key 一级分布：page:15；项目独有 key 一级分布：page:34；值不同 key 一级分布：page:100 |
| `src/config/locale/messages/zh/pages/pricing.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 79 个，项目独有 key 255 个，共同 key 值不同 5 个；diff-files 独有 key 一级分布：page:79；项目独有 key 一级分布：pricing:255；值不同 key 一级分布：metadata:2, page:3 |
| `src/config/locale/messages/zh/pages/showcases.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 1 个，项目独有 key 68 个，共同 key 值不同 25 个；diff-files 独有 key 一级分布：ui:1；项目独有 key 一级分布：page:63, ui:5；值不同 key 一级分布：metadata:2, page:2, showcases-flow:21 |
| `src/config/locale/messages/zh/settings/sidebar.json` | 两边都有，内容不同 | JSON 不同：diff-files 独有 key 0 个，项目独有 key 3 个，共同 key 值不同 3 个；diff-files 独有 key 一级分布：无；项目独有 key 一级分布：nav:3；值不同 key 一级分布：nav:1, top_nav:2 |

### 2.6 页面 / 主题 / 内容

| 文件 | 状态 | 差异摘要 |
|---|---|---|
| `content/docs/index.mdx` | 两边都有，内容不同 | 文本不同：diff-files 7 行，项目 7 行；相对项目 +2/-2 行，变更块 2 个；关键词计数 diff-files/项目：prompt:0/1；frontmatter key diff-files 独有 0 个，项目独有 0 个 |
| `content/docs/index.zh.mdx` | 两边都有，内容不同 | 文本不同：diff-files 7 行，项目 7 行；相对项目 +2/-2 行，变更块 2 个；frontmatter key diff-files 独有 0 个，项目独有 0 个 |
| `content/logs/v1.0.mdx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=1766 |
| `content/logs/v1.0.zh.mdx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=1716 |
| `content/logs/v2.0.mdx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=2230 |
| `content/logs/v2.0.zh.mdx` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=2029 |
| `content/pages/privacy-policy.mdx` | 两边都有，内容不同 | 文本不同：diff-files 64 行，项目 38 行；相对项目 +47/-21 行，变更块 11 个；关键词计数 diff-files/项目：token:1/0，credits:1/0，storage:2/0，prompt:2/0；frontmatter key diff-files 独有 0 个，项目独有 0 个 |
| `content/pages/privacy-policy.zh.mdx` | 两边都有，内容不同 | 文本不同：diff-files 58 行，项目 38 行；相对项目 +41/-21 行，变更块 11 个；frontmatter key diff-files 独有 0 个，项目独有 0 个 |
| `content/pages/terms-of-service.mdx` | 两边都有，内容不同 | 文本不同：diff-files 79 行，项目 48 行；相对项目 +61/-30 行，变更块 16 个；关键词计数 diff-files/项目：credits:0/5，permission:1/0，prompt:1/0；frontmatter key diff-files 独有 0 个，项目独有 0 个 |
| `content/pages/terms-of-service.zh.mdx` | 两边都有，内容不同 | 文本不同：diff-files 66 行，项目 48 行；相对项目 +48/-30 行，变更块 16 个；frontmatter key diff-files 独有 0 个，项目独有 0 个 |
| `content/posts/what-is-xxx.mdx` | 两边都有，内容不同 | 文本不同：diff-files 70 行，项目 67 行；相对项目 +39/-36 行，变更块 21 个；关键词计数 diff-files/项目：admin:1/2，prompt:0/7；frontmatter key diff-files 独有 0 个，项目独有 1 个 |
| `content/posts/what-is-xxx.zh.mdx` | 两边都有，内容不同 | 文本不同：diff-files 70 行，项目 67 行；相对项目 +39/-36 行，变更块 21 个；关键词计数 diff-files/项目：admin:0/1；frontmatter key diff-files 独有 0 个，项目独有 1 个 |
| `src/app/[locale]/(landing)/(ai)/ai-image-generator/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 93 行，项目 46 行；相对项目 +48/-1 行，变更块 7 个；import 差异：diff-files 独有 4 项，项目独有 0 项；声明差异：diff-files 独有 7 个，项目独有 0 个；关键词计数 diff-files/项目：locale:14/7 |
| `src/app/[locale]/(landing)/activity/layout.tsx` | 两边都有，内容不同 | 文本不同：diff-files 32 行，项目 31 行；相对项目 +1/-0 行，变更块 1 个 |
| `src/app/[locale]/(landing)/create/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 54 行，项目 54 行；相对项目 +10/-10 行，变更块 7 个；import 差异：diff-files 独有 1 项，项目独有 0 项；声明差异：diff-files 独有 3 个，项目独有 0 个；关键词计数 diff-files/项目：mock:6/0，provider:1/0，prompt:20/5 |
| `src/app/[locale]/(landing)/layout.tsx` | 两边都有，内容不同 | 文本不同：diff-files 51 行，项目 32 行；相对项目 +20/-1 行，变更块 4 个；import 差异：diff-files 独有 1 项，项目独有 1 项；声明差异：diff-files 独有 1 个，项目独有 0 个 |
| `src/app/[locale]/(landing)/pricing/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 59 行，项目 59 行；相对项目 +1/-1 行，变更块 1 个 |
| `src/app/[locale]/(landing)/settings/billing/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 274 行，项目 273 行；相对项目 +21/-20 行，变更块 11 个；import 差异：diff-files 独有 1 项，项目独有 1 项；关键词计数 diff-files/项目：callback:6/5 |
| `src/app/[locale]/(landing)/settings/credits/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 140 行，项目 146 行；相对项目 +11/-17 行，变更块 9 个 |
| `src/app/[locale]/(landing)/settings/layout.tsx` | 两边都有，内容不同 | 文本不同：diff-files 35 行，项目 28 行；相对项目 +10/-3 行，变更块 2 个；声明差异：diff-files 独有 2 个，项目独有 0 个 |
| `src/app/[locale]/(landing)/settings/payments/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 200 行，项目 202 行；相对项目 +3/-5 行，变更块 5 个 |
| `src/app/[locale]/(landing)/settings/profile/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 83 行，项目 84 行；相对项目 +1/-2 行，变更块 2 个 |
| `src/app/[locale]/(landing)/showcases/page.tsx` | 两边都有，内容不同 | 文本不同：diff-files 47 行，项目 35 行；相对项目 +20/-8 行，变更块 3 个；import 差异：diff-files 独有 1 项，项目独有 0 项；声明差异：diff-files 独有 2 个，项目独有 0 个；关键词计数 diff-files/项目：showcase:18/12 |
| `src/shared/blocks/console/layout.tsx` | diff-files 缺失 | 项目中存在，diff-files 同路径不存在；项目类型=文件；大小=4860 |
| `src/themes/default/blocks/blog-detail.tsx` | 两边都有，内容不同 | 文本不同：diff-files 135 行，项目 134 行；相对项目 +1/-0 行，变更块 1 个 |
| `src/themes/default/blocks/blog.tsx` | 两边都有，内容不同 | 文本不同：diff-files 105 行，项目 104 行；相对项目 +1/-0 行，变更块 1 个 |
| `src/themes/default/blocks/cta.tsx` | 两边都有，内容不同 | 文本不同：diff-files 62 行，项目 80 行；相对项目 +4/-22 行，变更块 6 个；import 差异：diff-files 独有 0 项，项目独有 1 项；声明差异：diff-files 独有 1 个，项目独有 3 个；关键词计数 diff-files/项目：prompt:0/6 |
| `src/themes/default/blocks/faq.tsx` | 两边都有，内容不同 | 文本不同：diff-files 75 行，项目 74 行；相对项目 +21/-20 行，变更块 12 个；import 差异：diff-files 独有 0 项，项目独有 1 项；声明差异：diff-files 独有 1 个，项目独有 0 个 |
| `src/themes/default/blocks/features-accordion.tsx` | 两边都有，内容不同 | 文本不同：diff-files 115 行，项目 128 行；相对项目 +30/-43 行，变更块 14 个 |
| `src/themes/default/blocks/features-step.tsx` | 两边都有，内容不同 | 文本不同：diff-files 69 行，项目 80 行；相对项目 +23/-34 行，变更块 12 个；import 差异：diff-files 独有 1 项，项目独有 1 项；声明差异：diff-files 独有 0 个，项目独有 2 个 |
| `src/themes/default/blocks/features.tsx` | 两边都有，内容不同 | 文本不同：diff-files 48 行，项目 64 行；相对项目 +10/-26 行，变更块 6 个 |
| `src/themes/default/blocks/social-avatars.tsx` | 两边都有，内容不同 | 文本不同：diff-files 40 行，项目 40 行；相对项目 +1/-1 行，变更块 1 个 |
| `src/themes/default/layouts/landing.tsx` | 两边都有，内容不同 | 文本不同：diff-files 25 行，项目 25 行；相对项目 +1/-1 行，变更块 1 个 |

### 2.7 数据库 / 预制数据

| 文件 | 状态 | 差异摘要 |
|---|---|---|
| `db/prompt_rows.sql` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=10141 |
| `db/showcase_rows.sql` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=10321 |

### 2.8 存储 / R2

| 文件 | 状态 | 差异摘要 |
|---|---|---|
| `src/app/api/storage/upload-image/route.ts` | 两边都有，内容不同 | 文本不同：diff-files 106 行，项目 103 行；相对项目 +26/-23 行，变更块 10 个；import 差异：diff-files 独有 0 项，项目独有 1 项；声明差异：diff-files 独有 0 个，项目独有 4 个 |
| `src/shared/services/storage.ts` | 两边都有，内容不同 | 文本不同：diff-files 64 行，项目 70 行；相对项目 +1/-7 行，变更块 3 个；import 差异：diff-files 独有 1 项，项目独有 2 项；声明差异：diff-files 独有 0 个，项目独有 1 个；关键词计数 diff-files/项目：R2:14/17 |

### 2.9 项目配置 / 文档 / 辅助文件

| 文件 | 状态 | 差异摘要 |
|---|---|---|
| `.gitignore` | 两边都有，内容不同 | 文本不同：diff-files 66 行，项目 69 行；相对项目 +1/-4 行，变更块 2 个 |
| `README.md` | diff-files 缺失 | 项目中存在，diff-files 同路径不存在；项目类型=文件；大小=2588 |
| `eslint.config.mjs` | 项目缺失 | diff-files 中存在，项目同路径不存在；diff-files 类型=文件；大小=1001 |
| `public/preview.png` | 两边都缺失 | diff-files 与项目同路径都不存在 |
