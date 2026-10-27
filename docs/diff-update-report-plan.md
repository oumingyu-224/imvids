# diff-update-report-plan

## 1. 计划目标

本计划基于 `diff-update-research.md`，用于把三份 diff 分析结果转成后续可审查、可批注、可执行的实现计划。

本计划不是最终实现，也不直接改代码。它的作用是：

- 完整覆盖 research 中识别到的所有模块。
- 说明每个模块要解决什么问题。
- 列出需要核查或可能修改的文件路径。
- 说明每类文件的修改意图。
- 标出风险、取舍、暂不实现内容。
- 给后续人工批注、拆 Todo、正式实现提供依据。

核心判断：这批 diff 不能整体覆盖当前项目，只能按模块选择性吸收。安全、稳定性、支付、R2、权限、AI 状态/积分优先；AI 队列、数据库 schema 等架构级功能单独立项；Admin dashboard / AI image dashboard 属于有价值的后台增强，只要不影响核心功能，可以接入；landing、主题、SEO 文案、生成器 UI 等本地定制区域默认不整体替换。

## 2. 总体实施原则

1. 不整体覆盖当前项目。
2. 不直接替换现有 landing、主题 blocks、生成器 UI、风控链路、SEO 文案。
3. 所有 diff-files 代码只能作为参考实现，必须按当前项目结构人工合并。
4. 每个模块单独处理、单独提交、单独验证。
5. 涉及数据库、支付、登录、权限、积分的改动必须保守处理。
6. 多语言文案按功能同步 key，不做大范围覆盖。
7. 页面和主题类改动必须保护当前线上视觉和产品定位。
8. 所有实现先在 `diffanalysis` 分支和 Vercel Preview 验证，不直接影响 production branch。
9. 不影响核心功能、不影响前端 SEO、不覆盖现有定制的低耦合增强，可以接入预览环境看效果，但不等于默认合并生产。

## 3. 模块计划

---

## 3.1 Auth / 登录 / 注册 / OAuth / 路由

### 业务目标

修复登录注册安全和稳定性问题，核查 OAuth popup 相关能力是否需要接入。

### 覆盖功能

- 登录/注册页配置泄露修复。
- 登录后 Not found 问题修复。
- 右上角用户状态刷新修复。
- sign-in / sign-up / sign-modal / sign-user / social-providers / verify-email 调整。
- OAuth popup / callback / layout 页面。
- locale-selector、settings service、middleware 相关路由稳定性问题。

### 需要核查或可能修改的文件

- `src/app/[locale]/(auth)/sign-in/page.tsx`
- `src/app/[locale]/(auth)/sign-up/page.tsx`
- `src/app/[locale]/(oauth)/auth-callback/page.tsx`
- `src/app/[locale]/(oauth)/auth-popup/page.tsx`
- `src/app/[locale]/(oauth)/layout.tsx`
- `src/shared/blocks/sign/sign-in-form.tsx`
- `src/shared/blocks/sign/sign-up-form.tsx`
- `src/shared/blocks/sign/sign-modal.tsx`
- `src/shared/blocks/sign/sign-user.tsx`
- `src/shared/blocks/sign/social-providers.tsx`
- `src/shared/blocks/sign/verify-email.tsx`
- `src/shared/blocks/common/locale-selector.tsx`
- `src/shared/services/settings.ts`
- `src/proxy.ts`

### 修改意图

- 移除或避免前端暴露敏感登录/注册配置。
- 修复登录后用户状态不刷新的问题。
- 修复 locale / auth route 引发的 Not found 问题。
- 如接入 OAuth popup，只补最小闭环，不替换现有登录主流程。
- 如果当前项目没有 middleware，不凭空照搬，必须先确认是否确实需要。

### 数据 / API / 类型变化

- 不优先新增数据库字段。
- 不优先改变现有登录 API 签名。
- 如 OAuth popup 需要新增 callback 参数，必须保持原登录流程兼容。

### 风险

- diff-files 登录相关文件不完整，不能直接作为完整补丁。
- 登录 UI 可能已有当前项目定制，不能整体覆盖。
- proxy/middleware 路由入口影响范围大，错误修改可能影响全站路由；当前以 `src/proxy.ts` 为准。

### 暂不实现

- 不整体替换登录页 UI。
- 不强行接入 OAuth popup，除非确认当前业务需要。
- 不凭空新增 `src/middleware.ts`，如需处理路由入口，优先核查当前 `src/proxy.ts`。

### 建议动作

优先进入第一阶段：安全和稳定性修复优先；OAuth popup、sign-modal 注册切换、sign-up-form 接入已确认可以做，但需要作为 Auth 体验增强小任务，不能和安全修复混成一个大覆盖。

### 已完成核查结论

- `sign-in/page.tsx`、`sign-up/page.tsx` 当前使用 `getConfigs()`，需要改为 `getPublicConfigs()`，避免把 DB 中的敏感配置序列化到 client component。
- 当前 `getPublicConfigs()` 已存在，且通过 `publicSettingNames` 白名单过滤。
- `publicSettingNames` 当前未包含 `email_verification_enabled`；但 `sign-up.tsx` 和后续 `sign-up-form` 需要在 client 判断邮箱验证开关，因此需要补这个公开 key。
- `publicSettingNames` 不应加入任何 secret / api key / signing secret / R2 key / provider key。
- `src/middleware.ts` 不按缺失处理；当前入口以 `src/proxy.ts` 为准，不新增 middleware。
- `src/proxy.ts` 差异只作为入口约定核查，不恢复 `middleware` 导出。
- `sign-user.tsx` 有本地 UI 定制：credits、我的作品、头像菜单、admin 入口、菜单宽度和样式；只能吸收 session fallback / 登录状态刷新逻辑，不能整体覆盖。
- `auth/config.ts` 有本地风控逻辑：登录限制、登录尝试记录、IP 注册积分限制；不能整体覆盖 diff 版本。
- `locale-selector.tsx` 差异主要是样式和 console；不覆盖当前样式，如处理只做明确 bug fix。
- OAuth popup 接入需要新增 oauth 页面、修改 `social-providers.tsx`，并在 `next.config.mjs` 增加 COOP header。
- sign-modal 注册切换需要 `sign-modal.tsx`、`sign-in-form.tsx`、`sign-up-form.tsx` 配套修改。
- Auth 必要文案还需要补 `email_password_name_required`、`sign_up_failed` 的 en/zh key；不修改任何 SEO 文案。
- `tsconfig.json` 差异只是格式化，不处理。

### Auth 最终收口状态

Auth 已完成本轮核查，没有新的大项需要继续分析。后续除非实现时遇到真实阻塞，否则按 Todo List 执行。

待执行内容收口为：

1. `sign-in/page.tsx`、`sign-up/page.tsx`：`getConfigs()` 改 `getPublicConfigs()`。
2. `publicSettingNames`：补 `email_verification_enabled`，且不加入任何敏感 key。
3. OAuth popup：接入 oauth 三个页面、`social-providers.tsx` popup/fallback 逻辑、`next.config.mjs` COOP header。
4. sign-modal 注册切换：接入 `sign-modal.tsx`、`sign-in-form.tsx`、`sign-up-form.tsx`。
5. 文案：补 `email_password_name_required`、`sign_up_failed` 的 en/zh key，不动 SEO 文案。
6. sign-user：只做 session fallback / 登录状态刷新，不覆盖 UI。
7. auth/config：只做必要 email verification 评估，不覆盖风控。
8. proxy：继续以 `src/proxy.ts` 为准，不新增 `src/middleware.ts`。
9. `tsconfig.json`：不处理。

---

## 3.2 AI 生图 / AI 任务链路

### 业务目标

核查并吸收 AI 任务状态、积分、失败处理、provider 查询等稳定性修复；完整异步队列作为单独立项。

### 覆盖功能

- AI generate / query / providers 接口。
- dispatch / notify 异步任务分发和回调。
- retry-r2 存储重试。
- AI extension 类型和 provider/custom 入口。
- AI task model / status / log / mock / showcase / concurrency / dispatch。
- generator image / music / video 调整。
- image-generator-examples 和 demo 图片。
- 积分校对、任务状态刷新、queued / pending / failed 处理。

### 需要核查或可能修改的文件

- `src/app/api/ai/generate/route.ts`
- `src/app/api/ai/query/route.ts`
- `src/app/api/ai/providers/route.ts`
- `src/app/api/ai/dispatch/route.ts`
- `src/app/api/ai/notify/route.ts`
- `src/app/api/ai/storage/retry-r2/route.ts`
- `src/extensions/ai/index.ts`
- `src/extensions/ai/types.ts`
- `src/extensions/ai/custom.ts`
- `src/shared/services/ai_task.ts`
- `src/shared/services/ai_task_dispatch.ts`
- `src/shared/services/ai_task_status.ts`
- `src/shared/services/ai_task_log.ts`
- `src/shared/services/ai_task_model.ts`
- `src/shared/services/ai_task_concurrency.test.ts`
- `src/shared/services/ai_task_mock.ts`
- `src/shared/services/ai_task_showcase.ts`
- `src/shared/blocks/generator/image.tsx`
- `src/shared/blocks/generator/music.tsx`
- `src/shared/blocks/generator/video.tsx`
- `src/shared/blocks/image-generator-examples/*`
- `public/demo/*`

### 修改意图

- 先核查任务状态是否能正确从 queued / pending / running / failed / succeeded 过渡。
- 核查积分扣减和失败退款/校对逻辑是否安全。
- 核查 provider 列表和 channel 配置是否正确返回。
- 只吸收当前项目缺失且低耦合的状态/错误处理修复。
- dispatch / notify / concurrency 不直接混入第一阶段，需要单独设计。

### 核心伪代码方向

```ts
// 查询任务状态时保持当前 API 兼容
const task = await getTaskById(taskId);
if (!task) return notFoundOrError();

// 统一处理 pending/queued/failed/succeeded
return normalizeTaskStatus(task, {
  keepExistingFields: true,
  includeFailureReason: true,
  includeMediaIfReady: true,
});
```

### 数据 / API / 类型变化

- 第一阶段不主动改数据库 schema。
- 不改变现有 generate/query API 的外部调用方式。
- 如需要新增 task status 字段，必须放入数据库单独立项。

### 风险

- AI 链路牵涉数据库、积分、回调、存储、前端轮询和风控。
- 当前项目已有风控和生成逻辑，直接覆盖会破坏现有业务。
- demo 图片和 examples 属于展示增强，不应和核心任务链路混在一起。

### 暂不实现

- 不整体替换生成器 UI。
- 不直接接入完整 dispatch / notify 队列。
- 不直接执行 AI task schema 迁移。
- 不批量引入 demo 图片。

### 建议动作

拆成两部分：

1. 第一阶段：AI 状态、积分、失败处理核查和小修复。
2. 单独立项：完整 AI 异步任务队列和任务状态机升级。

---

## 3.3 Activity 任务页 / 下载页 / 结果体验

### 业务目标

改善用户查看 AI 任务、刷新任务结果和下载生成结果的体验。当前项目已经把 ai-tasks 整合优化到“我的作品”中，因此本模块不按 diff 的 activity/ai-tasks 页面直接接入，而是以当前“我的作品”为基准，对比吸收下载、刷新、状态展示等能力。

### 覆盖功能

- AI 任务列表。
- 单个任务刷新页。
- 单个任务下载页。
- 下载页 client。
- activity layout。
- 失败、等待中、生成中状态展示。

<!-- 批注：ai-tasks已经被我整合优化到我的作品里面了，可以对比一下。 -->

### 处理批注后的调整

- 以当前“我的作品”实现为主，不恢复或照搬 diff 的独立 ai-tasks 页面。
- 对比 diff 中的任务刷新、下载页、结果展示、失败/等待状态处理。
- 有价值的能力合并到“我的作品”相关入口或详情页中。
- 如果 diff 的下载页可以复用，则改造成当前作品流的下载能力。

### 需要核查或可能修改的文件

- `src/app/[locale]/activity/ai-tasks/page.tsx`
- `src/app/[locale]/activity/ai-tasks/[id]/refresh/page.tsx`
- `src/app/[locale]/activity/ai-tasks/[id]/download/page.tsx`
- `src/app/[locale]/activity/ai-tasks/[id]/download/download-client.tsx`
- `src/app/[locale]/activity/layout.tsx`
- `src/shared/blocks/activity/*`
- `src/shared/components/ai-task-media.tsx`
- `src/shared/components/ai-task-error.tsx`

### 修改意图

- 基于当前项目现有“我的作品”和 task API 适配下载页。
- 不直接覆盖 activity layout，也不重新引入独立 ai-tasks 体系。
- 如果缺少 `ai-task-media`、`ai-task-error` 等组件，按当前项目风格补最小实现。
- 处理任务不存在、无权限、未完成、失败、存储文件缺失等状态。

### 数据 / API / 类型变化

- 不新增数据库字段。
- 只读取当前已有 task 结果字段。
- 如现有 API 不支持下载页所需字段，优先在查询层做兼容映射。

### 风险

- 下载页依赖底层 AI task 状态模型。
- 如果任务结果字段结构不同，直接搬页面会展示错误。

### 暂不实现

- 不重做整个 activity 模块。
- 不改变已有“我的作品”主结构，除非当前实现无法支持下载入口。

### 建议动作

第二阶段选择性功能，适合在 AI 状态查询稳定后实现。

---

## 3.4 Admin 后台

### 业务目标

核查后台权限、安全和普通管理页 bug fix；接入 Admin dashboard / AI image dashboard 作为后台增强能力，用于运营查看任务、失败情况、趋势数据，并扩展为可以查看每个用户生成的图片。该能力只做读取和展示，不影响核心生成链路。

### 覆盖功能

1. AI 图片后台仪表盘：
   - dashboard client
   - trend charts
   - failed tasks
   - tasks page
   - page.tsx
   - 生成任务量、失败任务、趋势图、provider 使用情况等后台看板能力
   - 扩展为可以查看每个用户生成的图片

<!-- 批注：改为可以查看每个用户生成的图片 -->
2. AI tasks 后台：
   - ai-tasks page
   - table
   - overview charts
   - lazy charts

3. 普通后台管理页面：
   - categories edit
   - prompts add/edit/delete/list
   - showcases add/edit/delete/list
   - users
   - settings tab
   - admin page/dashboard

4. 后台框架组件：
   - main-header
   - nav
   - search
   - sidebar-header
   - sidebar-user

5. 权限与服务：
   - RBAC permission
   - admin-content
   - admin-dashboard
   - admin-ai-image-dashboard
   - ai-provider-settings-card

### 需要核查或可能修改的文件

- `src/app/[locale]/admin/page.tsx`
- `src/app/[locale]/admin/dashboard/*`
- `src/app/[locale]/admin/ai-image-dashboard/*`
- `src/app/[locale]/admin/ai-tasks/*`
- `src/app/[locale]/admin/categories/*`
- `src/app/[locale]/admin/prompts/*`
- `src/app/[locale]/admin/showcases/*`
- `src/app/[locale]/admin/users/*`
- `src/app/[locale]/admin/settings/*`
- `src/shared/blocks/admin/main-header.tsx`
- `src/shared/blocks/admin/nav.tsx`
- `src/shared/blocks/admin/search.tsx`
- `src/shared/blocks/admin/sidebar-header.tsx`
- `src/shared/blocks/admin/sidebar-user.tsx`
- `src/shared/blocks/admin/ai-provider-settings-card.tsx`
- `src/core/rbac/permission.ts`
- `src/shared/lib/admin-content.ts`
- `src/shared/services/admin-dashboard.ts`
- `src/shared/services/admin-ai-image-dashboard.ts`

### 修改意图

- 优先核查 RBAC 和后台权限边界。
- 普通后台页面只吸收明确 bug fix，不整体覆盖页面结构。
- Admin dashboard / AI image dashboard 可以接入，因为它是后台读取型增强，对核心功能影响小。
- 看板只读取现有任务、用户、provider、失败状态等数据；如遇到缺失字段，先做兼容读取，不直接改核心生成链路。
- 增加后台按用户查看生成图片的能力，方便运营排查和管理。
- 后台框架组件只合并明确的交互、布局和状态修复。

### 数据 / API / 类型变化

- RBAC 权限 key 如有新增，必须确认当前后台菜单和权限判断都能兼容。
- AI dashboard 接入时可能需要新增统计 service 和 task 聚合查询。
- 查看每个用户生成图片时，优先复用现有用户、任务、作品/图片结果表关系。
- 第一阶段不改 admin 数据模型；如果看板必须依赖新字段，再单独确认数据库更新。

### 风险

- 后台页面和当前业务字段强绑定。
- 权限错误会导致越权或后台入口丢失。
- AI dashboard 依赖 AI task/provider 数据；如果现有数据不完整，需要做降级展示，不能影响核心功能。

### 暂不实现

- 不整体替换后台 UI。
<!-- 批注：后台UI具体有哪些优化，可以列一下 -->
- 不把 AI image dashboard 接入和核心 AI 生成链路改造混在一起。
- 不第一阶段接 provider settings card 的完整配置闭环。


### 后台 UI 优化需要具体核查的点

根据 diff 中后台框架组件和页面差异，后续需要列出并逐项判断这些 UI 优化是否接入：

- `main-header`：顶部标题、操作区、响应式布局、用户状态展示。
- `nav`：后台导航结构、激活态、分组、折叠行为。
- `search`：后台搜索入口、快捷搜索、空状态和 loading 状态。
- `sidebar-header`：侧边栏品牌区、折叠状态、项目入口。
- `sidebar-user`：管理员用户信息、退出入口、账号菜单。
- 普通后台表格：分页、筛选、排序、批量操作、行操作按钮。
- AI tasks 表格：任务状态、用户、provider、失败原因、图片结果入口。
- Dashboard charts：趋势图、失败任务图、任务量统计图、provider 使用统计。
- 页面布局：卡片间距、标题层级、移动端适配、loading/empty/error 状态。

接入原则：只接入不影响现有功能的后台体验优化；不为了 UI 优化改动核心业务接口。

### 建议动作

分四步：

1. RBAC / permission 优先核查。
2. 普通后台页面逐页合并 bug fix。
3. 后台框架组件只吸收明确修复。
4. 接入 Admin dashboard / AI image dashboard 的读取型看板能力。
5. 增加后台按用户查看生成图片的能力。

---

## 3.5 Payment / Paypal / Stripe / 订单 / 依赖

### 业务目标

修复支付回调安全问题，核查 payment service / order model / Paypal / Stripe 差异；Paypal 订阅扣费可以作为可选接入项，但前提是不影响现有 checkout、callback、订单权益发放和已有支付 provider。

### 覆盖功能

- Paypal 订阅扣费。
- Stripe / Paypal payment extension。
- checkout / callback 接口。
- callback token 加固。
- payment service。
- order model。
- callback route test。
- package / lockfile 支付依赖。
- pricing locale/theme 联动。

### 需要核查或可能修改的文件

- `src/app/api/payment/checkout/route.ts`
- `src/app/api/payment/callback/route.ts`
- `src/app/api/payment/callback/route.test.ts`
- `src/extensions/payment/paypal.ts`
- `src/extensions/payment/stripe.ts`
- `src/shared/services/payment.ts`
- `src/shared/models/order.ts`
- `src/app/[locale]/pricing/page.tsx`
- `src/config/locale/messages/en/pages/pricing.json`
- `src/config/locale/messages/zh/pages/pricing.json`
- `package.json`
- `pnpm-lock.yaml`

### 修改意图

- 优先合并 callback token 安全加固。
- 核查支付回调是否能防伪造、防重复处理、防状态错乱。
- 保持当前 order model 和 payment service 对外行为兼容。
- Paypal 订阅作为可选接入项核查；如果能在不影响现有支付流程的情况下接入，可以纳入本轮预览验证。
- package / lockfile 只合并必要依赖，不做无关升级。

### 核心伪代码方向

```ts
const token = request.nextUrl.searchParams.get('token');
if (!isValidPaymentCallbackToken(token)) {
  return unauthorized();
}

const event = await parseProviderCallback(request);
await handlePaymentCallbackIdempotently(event);
```

### 数据 / API / 类型变化

- 不第一阶段改订单表结构。
- 不改变 checkout API 参数。
- 如 Paypal 订阅需要新增 subscription 字段或改变订单模型，必须单独确认数据库和支付模型，不混入 callback 安全修复。

### 风险

- 支付不能直接覆盖。
- `src/extensions/payment/stripe.ts` 在 diff-files 中缺失，但 2026 更新中提到 Stripe payment extension，需要另查当前项目和来源。
<!-- 批注：缺失那个文件，具体标注一下，我去找一下 -->
- lockfile 影响全项目构建和部署。

### 接入约束 / 暂不实现

- Paypal 订阅可以接入，但前提是不影响现有 checkout、callback、订单权益发放和已有支付 provider。
<!-- 批注：这个可以接入，不影响功能的情况下 -->
- 不为了 Paypal 订阅强行改变现有订单模型或支付回调语义。
- 不整体替换 pricing 页面和文案。
- 不无差别升级依赖。

### 建议动作

第一阶段优先做 callback token 和回调安全核查；Paypal 订阅改为可选接入项，在不影响现有支付功能的情况下接入。

---

## 3.6 Storage / R2 / 上传

### 业务目标

提升 R2 配置兼容性、错误信息可读性和存储稳定性，同时保护当前上传安全策略。

### 覆盖功能

- R2 endpoint/account 配置方式调整。
- R2 错误信息解析增强。
- storage service。
- upload-image route。
- ai storage retry-r2 route。

### 需要核查或可能修改的文件

- `src/extensions/storage/r2.ts`
- `src/shared/services/storage.ts`
- `src/app/api/storage/upload-image/route.ts`
- `src/app/api/ai/storage/retry-r2/route.ts`
- `src/env.ts`
- `.env.example`

### 修改意图

- 合并 R2 endpoint/account 配置兼容修复。
- 增强 R2 错误信息解析，方便定位上传失败。
- 不放宽 upload-image 权限、大小、数量和 MIME allowlist。
- retry-r2 与 AI 任务链路绑定，后续按 AI 任务方案处理。

### 数据 / API / 类型变化

- 不新增数据库字段。
- 环境变量如果新增，必须更新 `.env.example` 并保持旧变量兼容。

### 风险

- 上传接口安全策略被覆盖会带来滥用风险。
- retry-r2 如果缺少任务状态闭环，可能重复写入或状态错乱。

### 暂不实现

- 不放宽上传限制。
- 不第一阶段接 retry-r2 完整重试闭环。

### 建议动作

第一阶段优先合并 R2 配置和错误处理；retry-r2 随 AI 任务链路评估。

---

## 3.7 多语言 / 文案
<!-- 批注：影响前端seo的文案一点都不要动 -->

### 业务目标

保证被采纳的新功能拥有必要文案 key，同时严格保护前端 SEO 文案：凡是会影响 landing、首页、pricing、showcases、blog、docs、法务页、meta/title/description、结构化内容的文案，一点都不要动。

### 覆盖功能

- activity ai-tasks / sidebar。
- admin ai-tasks / dashboard / prompts / settings / showcases / sidebar。
- ai chat / image / music / video。
- common。
- landing。
- pages blog / create / hairstyles / index / pricing / showcases / updates。
- 前端 SEO 相关 title / description / hero / faq / content 文案。
- settings sidebar。
- locale index。

### 需要核查或可能修改的文件

- `src/config/locale/messages/en/activity/*.json`
- `src/config/locale/messages/zh/activity/*.json`
- `src/config/locale/messages/en/admin/*.json`
- `src/config/locale/messages/zh/admin/*.json`
- `src/config/locale/messages/en/ai/*.json`
- `src/config/locale/messages/zh/ai/*.json`
- `src/config/locale/messages/en/common.json`
- `src/config/locale/messages/zh/common.json`
- `src/config/locale/messages/en/landing.json`
- `src/config/locale/messages/zh/landing.json`
- `src/config/locale/messages/en/pages/*.json`
- `src/config/locale/messages/zh/pages/*.json`
- `src/config/locale/messages/en/settings/*.json`
- `src/config/locale/messages/zh/settings/*.json`
- `src/config/locale/index.ts`

### 修改意图

- 采用哪个功能，就同步哪个功能需要的最小文案 key。
- admin/dashboard 缺失文案只在接入对应后台功能时补。
- pricing 文案只处理 bug fix 或缺 key，不整体替换表达。
- landing / index / pricing / showcases / blog / docs / 法务 / meta 等所有影响前端 SEO 的文案完全不动。

### 数据 / API / 类型变化

- 不涉及数据库。
- 如果 locale index 需要注册新 namespace，必须确认所有 locale 都有对应文件。

### 风险

- 多语言文件包含大量品牌和营销内容，整体覆盖会破坏 SEO。
- key 不同步会导致页面运行时报错或显示缺失。

### 暂不实现

- 不整体覆盖 en/zh messages。
- 不替换 landing、index、showcases、pricing、blog、docs、法务、meta 的任何 SEO 文案。

### 建议动作

作为所有功能的配套任务：每接一个功能，只补对应最小 key。

---

## 3.8 页面 / 主题 / 内容

### 业务目标

只吸收明确 bug fix 或新功能必要页面，不覆盖当前线上 UI、主题和内容体系。

### 覆盖功能

- landing 页面。
- pricing / create / showcases / activity / settings 页面。
- ai-image-generator 页面。
- themes default blocks：blog / blog-detail / cta / faq / features / social-avatars / layout。
- content docs / logs / pages / posts。
- privacy-policy、terms-of-service、what-is-xxx 等内容。
- global.css / theme.css 样式。

### 需要核查或可能修改的文件

- `src/app/[locale]/page.tsx`
- `src/app/[locale]/pricing/page.tsx`
- `src/app/[locale]/create/page.tsx`
- `src/app/[locale]/showcases/page.tsx`
- `src/app/[locale]/activity/*`
- `src/app/[locale]/settings/*`
- `src/app/[locale]/ai-image-generator/page.tsx`
- `src/themes/default/blocks/*`
- `content/docs/*`
- `content/logs/*`
- `content/pages/*`
- `content/posts/*`
- `src/app/globals.css`
- `src/styles/theme.css`

### 修改意图

- Activity 下载页、pricing 局部修复、settings 布局修复可以单独吸收。
- content logs 如需要 changelog，可作为低风险内容新增。
- themes blocks 只作为参考，不整体覆盖。
- 法务、博客、docs 默认不跟随 diff 更新。

### 数据 / API / 类型变化

- 不涉及数据库。
- 页面路由如果新增，必须确认 sitemap、locale 和导航是否需要同步。

### 风险

- 这是最容易破坏当前线上视觉、SEO 和转化的区域。
- diff-files 的主题可能属于另一套站点表达。

### 暂不实现

- 不整体替换 landing。
- 不整体替换 themes default blocks。
- 不整体替换法务、博客、docs、营销内容。
- 不整体替换 global.css / theme.css。

### 建议动作

默认不更新；只拆出明确 bug fix 或被采纳功能必须依赖的页面。

---

## 3.9 数据库 / Schema / 预制数据

### 业务目标

按功能评估 schema 变化，不直接覆盖数据库结构；预制数据仅作为参考。

### 覆盖功能

- `schema.mysql.ts`
- `schema.postgres.ts`
- `schema.sqlite.ts`
- `prompt_rows.sql`
- `showcase_rows.sql`
- Showcase 公开/私有字段。
- AI task 相关字段。
- prompts/showcases 预制数据。

### 需要核查或可能修改的文件

- `src/db/schema.mysql.ts`
- `src/db/schema.postgres.ts`
- `src/db/schema.sqlite.ts`
- `db/prompt_rows.sql`
- `db/showcase_rows.sql`
- `src/shared/models/showcase.ts`
- `src/shared/models/prompt.ts`
- `src/shared/models/ai_task.ts`
- `src/shared/services/showcase.ts`
- `src/shared/services/prompt.ts`
- `src/shared/services/ai_task.ts`

### 修改意图

- 先具体核查数据库相关更新有哪些，而不是简单跳过。
- AI task schema 只在 AI 队列立项时处理。
- Showcase public/private 可见性单独评估。
- prompt/showcase 预制 SQL 只作为数据参考，不直接执行到生产。
- schema 迁移必须使用当前项目已有迁移方式。


### 数据库更新核查清单

后续需要把数据库相关更新逐项看清楚，至少包括：

1. AI task 相关字段
   - 是否新增或调整任务状态字段。
   - 是否新增 provider/channel/model 记录字段。
   - 是否新增失败原因、重试次数、回调状态、日志字段。
   - 是否影响积分扣减、失败退款或任务结果查询。

2. Showcase 相关字段
   - 是否新增 public/private 可见性控制。
   - 是否影响前台 showcases 展示、后台审核、用户作品展示。
   - 是否需要兼容历史 showcase 数据。

3. Prompt 相关字段
   - 是否只是预制数据变化。
   - 是否新增分类、排序、展示状态、SEO 字段。
   - 是否会影响当前 prompts 页面或后台 prompts 管理。

4. Payment / subscription 相关字段
   - Paypal 订阅如需新增 subscription id、周期、状态、续费时间等字段，必须单独确认。
   - 不允许为了接 Paypal 订阅直接改坏现有 order model。

5. Admin dashboard 统计依赖
   - dashboard 优先基于现有表做只读统计。
   - 如果统计必须依赖新增字段，先降级展示或单独列 schema 需求。

6. 预制 SQL
   - `db/prompt_rows.sql` 和 `db/showcase_rows.sql` 只作为参考数据。
   - 不直接执行到生产库。
   - 如要导入，必须先确认是否符合当前站点定位、SEO 和内容策略。

7. 迁移方式
   - 所有字段变化必须有迁移脚本、回滚方案和兼容读取逻辑。
   - 不直接覆盖 `schema.mysql.ts` / `schema.postgres.ts` / `schema.sqlite.ts`。

### 数据 / API / 类型变化

- 任何 schema 字段变化都必须有迁移方案、回滚方案和兼容读取逻辑。
- 不直接替换 schema 文件。

### 风险

- 数据库改动风险最高。
- 直接覆盖 schema 可能破坏现有风控、生成链路、用户资产和后台。

### 暂不实现

- 不第一阶段改 schema。
- 不直接执行预制 SQL。
- 不把 prompt/showcase 数据作为生产迁移。

### 建议动作

先完成数据库更新核查清单；确认哪些只是参考数据，哪些是真正 schema 需求。真正涉及字段变化的内容再单独立项，每个字段变化都必须对应明确业务目标。

---

## 3.10 项目配置 / 依赖 / README / skills / 辅助文件

### 业务目标

核查安全、部署和功能必要依赖；README、preview、skills 等辅助文件低优先级处理。

### 覆盖功能

- `.gitignore`
- `eslint.config.mjs`
- `next.config.mjs`
- `tsconfig.json`
- `package.json`
- `pnpm-lock.yaml`
- `README.md`
- `public/preview.png`
- `.claude/skills/shipany-page-builder`
- `.claude/skills/shipany-quick-start`

### 需要核查或可能修改的文件

- `.gitignore`
- `eslint.config.mjs`
- `next.config.mjs`
- `tsconfig.json`
- `package.json`
- `pnpm-lock.yaml`
- `README.md`
- `public/preview.png`
- `.claude/skills/*`

### 修改意图

- package / lockfile 只合并安全、部署或被采纳功能必须依赖的更新。
- next.config 如涉及 OAuth COOP header 或部署修复，需要单独核查。
- tsconfig/eslint 只在当前项目确实需要时接入。
- README、preview、skills 不影响线上功能，默认低优先级。

### 数据 / API / 类型变化

- 依赖升级可能引发类型、构建和运行时变化，必须单独验证。
- next.config 改动可能影响 headers、images、redirects、i18n 和部署行为。

### 风险

- lockfile 影响全项目。
- next.config/tsconfig 影响构建和路由。
- 工具配置迁移可能引入大量无关改动。

### 暂不实现

- 不无差别升级依赖。
- 不把 README/preview/skills 纳入核心更新。

### 建议动作

按功能依赖处理；安全和部署修复优先，辅助文件最后处理或不处理。

## 4. 建议实施顺序

### Phase 1：安全和稳定性修复

1. Auth 登录/注册配置泄露与登录状态刷新。
2. Payment callback token 加固。
3. R2 配置与 storage 错误处理。
4. RBAC / permission 后台权限核查。
5. AI 任务状态、失败处理、积分校对核查。

### Phase 2：低耦合功能增强

1. Activity 下载页 / 任务结果体验，并合并到当前“我的作品”体系。
2. Admin dashboard / AI image dashboard 读取型看板接入。
3. 后台按用户查看生成图片。
4. Admin 普通管理页明确 bug fix。
5. 后台 UI 小优化。
6. Pricing / settings 局部修复。
7. Prompts 页面评估和最小接入。
8. Paypal 订阅在不影响现有支付功能的情况下可选接入。

### Phase 3：单独立项

1. AI 异步任务队列 dispatch / notify / status / log 全链路。
2. 数据库 schema 迁移。
3. Showcase public/private 可见性。
4. 需要改核心支付模型的 Paypal 订阅深度改造。

### Phase 4：低优先级或仅参考

1. demo 图片素材。
2. image-generator-examples 展示轮播。
3. content logs。
4. README / preview。
5. Claude skills。
6. 预制 prompt/showcase SQL。

## 5. 暂不实现范围

以下内容本轮默认不实现，除非后续人工批注明确要求：

- 整体覆盖 landing 首页。
- 整体覆盖 themes default blocks。
- 整体覆盖 generator UI。
- 整体覆盖 locale messages。
- 整体覆盖 docs / blog / 法务内容。
- 放宽 upload-image 安全策略。
- 直接替换 auth/schema/风控链路。
- 直接执行数据库预制 SQL。
- 无差别升级 package / lockfile。
- 直接接入完整 AI 队列。
- 为接入 dashboard 而改动核心 AI 生成链路。
- 影响现有支付流程的 Paypal 订阅改造。

## 6. 验证计划

正式实现后，每个模块单独验证。

### Auth

- 登录页不暴露敏感配置。
- 登录后右上角用户状态刷新正常。
- locale 切换和登录跳转不出现 Not found。
- 原有登录方式不被破坏。

### Payment

- callback 无 token 或 token 错误时拒绝。
- callback 重复请求不会重复发放权益。
- 原 checkout 流程兼容。

### Storage / R2

- R2 上传成功。
- R2 错误信息可读。
- upload-image 限制未被放宽。

### AI task

- queued / pending / failed / succeeded 状态展示正确。
- 积分扣减和失败处理正确。
- 原有生成器 UI 和风控不被替换。

### Activity

- 任务结果页可访问。
- 下载页能处理未完成、失败、无权限、文件缺失等状态。

### Admin

- 普通管理员和非管理员权限边界正确。
- prompts / showcases / users / settings 页面原有功能可用。

### Locale / 页面

- 新接入功能没有缺失文案 key。
- landing、pricing、showcases SEO 文案未被误覆盖。

## 7. Todo List 草案

> 该 Todo List 按当前最新版 plan 修正。Auth 已完成核查，以下为待执行清单；除非明确要求按 Todo 改代码，否则不进入代码实现。

### Phase 1：安全稳定性优先

- [x] Auth 安全修复：在 `src/app/[locale]/(auth)/sign-in/page.tsx` 中将 `getConfigs()` 改为 `getPublicConfigs()`。
- [x] Auth 安全修复：在 `src/app/[locale]/(auth)/sign-up/page.tsx` 中将 `getConfigs()` 改为 `getPublicConfigs()`。
- [x] Auth 公开配置：在 `src/shared/services/settings.ts` 的 `publicSettingNames` 中补 `email_verification_enabled`。
- [x] Auth 公开配置：确认不向 `publicSettingNames` 加入任何 secret / api key / signing secret / R2 key / provider key。
- [x] Auth 路由入口：保持 `src/proxy.ts` 为当前入口，不新增 `src/middleware.ts`，不恢复 `export const middleware = proxy`。
- [x] Auth 登录状态：在 `src/shared/blocks/sign/sign-user.tsx` 中只吸收 session fallback / `authClient.getSession()` 兜底 / `isPending` 未结束不清空 user 等逻辑。
- [x] Auth 登录状态：保留 `sign-user.tsx` 当前 credits、我的作品、头像菜单、admin 入口、菜单宽度、样式等 UI 定制。
- [x] Auth 风控保护：`src/core/auth/config.ts` 不整体覆盖，保留登录限制、登录尝试记录、IP 注册积分限制等现有风控。
- [x] Auth 邮箱验证：如需调整 `src/core/auth/config.ts`，只选择性处理 email verification / autoSignIn / sendVerificationEmail，不破坏现有注册登录流程。
- [x] Auth locale：`src/shared/blocks/common/locale-selector.tsx` 不覆盖样式；如后续发现实际 Not found / locale bug，只做最小修复。
- [ ] Payment：核查 callback token 加固方案。
- [ ] Payment：核查 callback 重复处理、伪造请求、订单权益发放是否安全。
- [ ] Payment：核查 payment service / order model 差异，保持现有 checkout 和订单流程兼容。
- [ ] Storage/R2：核查 R2 endpoint/account 配置和 storage 错误处理差异。
- [ ] Storage/R2：核查 upload-image 当前权限、大小、数量、MIME 限制，确认不放宽。
- [ ] Admin：核查 RBAC / permission 差异和后台权限边界。
- [ ] AI task：核查任务状态、失败处理、积分扣减/校对差异。

### Phase 2：可以接入的低耦合增强

- [ ] Activity：对比 diff 的 ai-tasks 能力和当前“我的作品”实现。
- [ ] Activity：设计下载页/下载能力的最小接入方案，并合并到当前“我的作品”体系。
- [ ] Activity：设计任务结果状态展示方案，覆盖 pending / queued / failed / succeeded。
- [ ] Admin dashboard：设计 Admin dashboard / AI image dashboard 读取型接入方案。
- [ ] Admin dashboard：设计失败任务、趋势图、任务量、provider 使用情况等看板展示。
- [ ] Admin 图片管理：设计后台按用户查看生成图片方案。
- [ ] Admin UI：逐项核查后台 UI 优化：main-header、nav、search、sidebar-header、sidebar-user、表格、AI tasks 表格、charts、页面布局。
- [ ] Admin 普通页面：逐页核查 prompts / showcases / users / settings / categories 的明确 bug fix。
- [ ] Pricing / Settings：核查局部修复，但不改任何前端 SEO 文案。
- [ ] Prompts：评估公共 Prompts 页面是否接入；如接入，只做最小功能和必要非 SEO 文案 key。
- [x] Auth OAuth popup：接入 `src/app/[locale]/(oauth)/auth-popup/page.tsx`、`src/app/[locale]/(oauth)/auth-callback/page.tsx`、`src/app/[locale]/(oauth)/layout.tsx` 前，确认 callbackURL、locale 前缀、popup 关闭通知和主页面刷新逻辑。
- [x] Auth OAuth popup：修改 `src/shared/blocks/sign/social-providers.tsx` 时只接入 popup 登录和 fallback redirect，不破坏现有 Google/GitHub 登录可用性。
- [x] Auth OAuth popup：如接入 popup，在 `next.config.mjs` 增加 `Cross-Origin-Opener-Policy: same-origin-allow-popups` header。
- [x] Auth sign-modal：接入登录/注册弹窗切换时，修改 `src/shared/blocks/sign/sign-modal.tsx`，保留当前 Dialog/Drawer 响应式结构。
- [x] Auth sign-in-form：为 `src/shared/blocks/sign/sign-in-form.tsx` 增加 `onSwitchToSignUp` 可选回调；无回调时继续跳转 `/sign-up`，保持原页面流程兼容。
- [x] Auth sign-up-form：新增或接入 `src/shared/blocks/sign/sign-up-form.tsx`，支持 name/email/password 注册、邮箱验证提示、注册成功刷新 session、切回登录。
- [x] Auth 文案：为弹窗注册和 sign-up-form 补 `common.sign.email_password_name_required`、`common.sign.sign_up_failed` 的 en/zh key，不修改任何 SEO 文案。
- [ ] Paypal：核查 Paypal 订阅是否能在不影响现有 checkout、callback、订单权益发放和已有支付 provider 的情况下接入。
- [ ] Locale：为已接功能补最小必要 key，严格不修改 landing、首页、pricing、showcases、blog、docs、法务、meta 等前端 SEO 文案。

### Phase 3：需要单独立项或进一步核查

- [ ] AI 队列：如果要做 dispatch / notify / status / log 全链路，单独写 AI 异步任务队列 research/plan。
- [ ] 数据库：按数据库更新核查清单整理具体字段变化。
- [ ] 数据库：核查 AI task 字段、Showcase 字段、Prompt 字段、Payment/subscription 字段、Admin dashboard 统计依赖、预制 SQL、迁移方式。
- [ ] 数据库：对确实需要字段变化的内容，再单独写 schema 迁移 research/plan。
- [ ] Showcase：如需要 public/private 可见性控制，单独写 research/plan。
- [ ] Paypal：如果订阅接入必须改变订单模型或新增 subscription 字段，再单独写支付订阅深度改造 research/plan。

### Phase 4：明确不做或低优先级

- [ ] 不整体覆盖 landing 首页。
- [ ] 不整体覆盖 themes default blocks。
- [ ] 不整体覆盖 generator UI。
- [ ] 不整体覆盖 locale messages。
- [ ] 不修改任何影响前端 SEO 的文案。
- [ ] 不整体覆盖 docs / blog / 法务内容。
- [ ] 不放宽 upload-image 安全策略。
- [ ] 不直接替换 auth / schema / 风控链路。
- [ ] 不直接执行 prompt_rows.sql / showcase_rows.sql。
- [ ] 不无差别升级 package / pnpm-lock。
- [ ] 不为了 dashboard 改动核心 AI 生成链路。
- [ ] 不处理 README / preview.png 这类文档或展示资源。

## 8. 后续人工批注建议

建议你重点批注以下问题：


1. OAuth popup 是否需要接入。
2. Activity 下载页是否作为第一批功能。
3. Prompts 页面是否符合当前产品方向。
4. Admin 普通管理页哪些必须修。
<!-- 批注：不影响功能的情况下都可以加上看看效果 -->
5. AI 队列是否要单独做完整升级。
6. Paypal 订阅接入到什么程度。
7. Showcase public/private 是否需要。
8. 哪些页面、文案、主题必须明确禁止改动。

<!-- 批注：数据库相关的要看看有哪些更新 -->
批注完成后，再进入下一步：处理批注并细化正式 Todo List。仍然不要直接实现代码。## 9. 本次根据批注更新了什么

### 9.1 批注逐条处理记录

1. `ai-tasks 已经被整合优化到我的作品里面了，可以对比一下`
   - 已处理。
   - Activity 模块改为以当前“我的作品”为基准。
   - 后续只对比吸收下载、刷新、状态展示等能力，不直接恢复 diff 的独立 ai-tasks 页面。

2. `改为可以查看每个用户生成的图片`
   - 已处理。
   - Admin dashboard / AI image dashboard 增加“后台按用户查看生成图片”的目标。
   - 该能力按读取型后台增强处理，不改核心生成链路。

3. `后台 UI 具体有哪些优化，可以列一下`
   - 已处理。
   - 已新增后台 UI 优化核查清单：main-header、nav、search、sidebar-header、sidebar-user、普通后台表格、AI tasks 表格、dashboard charts、页面布局等。

4. `缺失那个文件，具体标注一下，我去找一下`
   - 已处理。
   - 已明确标注缺失文件为 `src/extensions/payment/stripe.ts`。

5. `Paypal 这个可以接入，不影响功能的情况下`
   - 已处理。
   - Payment 模块统一改为：Paypal 订阅可选接入，前提是不影响现有 checkout、callback、订单权益发放和已有支付 provider。
   - Todo 中新增 Paypal 可选接入核查。
   - 只有当 Paypal 订阅必须改变订单模型时，才单独立项。

6. `影响前端 SEO 的文案一点都不要动`
   - 已处理。
   - 多语言/文案模块加强约束：landing、首页、pricing、showcases、blog、docs、法务、meta/title/description、hero、faq、content 等 SEO 文案都不动。
   - Todo 中明确只补功能必要 key，不改任何前端 SEO 文案。

7. `不影响功能的情况下都可以加上看看效果`
   - 已处理。
   - 总体实施原则新增：不影响核心功能、不影响前端 SEO、不覆盖现有定制的低耦合增强，可以接入预览环境看效果。
   - Phase 2 中加入 dashboard、按用户查看生成图片、后台 UI 小优化、Paypal 可选接入。

8. `数据库相关的要看看有哪些更新`
   - 已处理。
   - 数据库模块新增“数据库更新核查清单”。
   - 需要具体核查 AI task 字段、Showcase 字段、Prompt 字段、Payment/subscription 字段、Admin dashboard 统计依赖、预制 SQL、迁移方式。

### 9.2 本次清理的旧冲突表述

1. 清理 Payment 中“Paypal 订阅只保留后续立项”的旧表达，统一为“可选接入，但不能影响现有支付功能”。
2. 清理 Todo 中“AI dashboard 独立 research/plan”的旧表达，改为 Phase 2 的读取型 dashboard 接入方案。
3. 清理 Todo 中“Paypal 订阅独立 research/plan”的旧表达，改为先做可选接入核查；只有涉及核心订单模型变化时才单独立项。
4. 保留数据库 schema 单独立项原则，但新增前置核查清单，避免简单跳过数据库更新。
