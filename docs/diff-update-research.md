# diff-update research：三份 diff 报告整合研究

## 1. 研究目的

这份 research 的目的，是把三个 diff 相关 md 的信息整合成后续最终报告的依据。最终报告要用于指导下一步是否更新、先更新什么、哪些不能动，因此本 research 必须覆盖完整模块，而不是只复述 `chatgptimage2-diff-analysis.md` 里原有的几个功能点。

研究输入：

- `chatgptimage2-diff-analysis.md`
- `chatgptimage2-diff-analysis-missing-2026.md`
- `chatgptimage2-diff-files-missing-2026-compare.md`

## 2. 三份输入文件的职责

### 2.1 `chatgptimage2-diff-analysis.md`

职责：判断 diff-files 作为功能候选池时，哪些功能值得吸收，哪些不建议直接覆盖。

特点：

- 强调不要整体覆盖当前项目。
- 强调当前项目已有 landing/UI/生成器/作品流/风控等本地定制。
- 重点分析 Prompts 页面、Activity 下载页、支付 token、AI 队列、AI 后台、Showcase、OAuth、R2 等功能。
- 缺点是覆盖范围不完整，很多 2026 更新没有进入建议分层。

### 2.2 `chatgptimage2-diff-analysis-missing-2026.md`

职责：补出 `chatgptimage2-diff-analysis.md` 相比 2026 更新遗漏的信息。

特点：

- 补了 2026 提交时间线。
- 补了大量未显式覆盖的文件路径。
- 明确暴露出原分析漏掉了登录安全修复、后台普通管理页、多语言、页面、配置、依赖、预制数据等范围。

### 2.3 `chatgptimage2-diff-files-missing-2026-compare.md`

职责：把缺失清单中的文件实际拿 `chatgptimage2-diff-files/` 和当前项目同路径做对比。

特点：

- 共检查 158 个路径。
- 112 个两边都有但内容不同。
- 37 个 diff-files 有、当前项目缺失。
- 7 个 diff-files 缺失、当前项目有。
- 2 个两边都缺失。

这份文件说明：最终判断不能停留在“有哪些功能”，还必须看每个模块在当前项目里是缺失、不同，还是 diff-files 也不完整。

## 3. 总体判断基础

### 3.1 这批更新不是一个可直接覆盖的补丁

原因：

- 当前项目已经有明显本地定制，尤其是 landing/UI/生成器/作品流/风控。
- diff-files 内部也不是完全闭合的最终补丁，有些功能依赖当前项目没有的模块或不同的数据结构。
- 大量页面、主题、文案、内容属于另一套模板或站点表达，不一定适合当前项目。

### 3.2 这批更新也不能简单忽略

原因：

- 有登录/注册配置泄露修复。
- 有登录状态刷新、OAuth、路由稳定性修复。
- 有 R2/storage、支付回调、依赖安全等基础设施修复。
- 有 Prompts、Activity 下载页、AI 任务链路、Admin 后台等明确功能增量。

### 3.3 最终报告必须采用“模块级决策”

每个模块都要回答：

- 更新了什么。
- 当前项目差异状态是什么。
- 是否建议更新。
- 如何更新，是直接吸收、人工合并、单独立项，还是不建议动。
- 风险是什么。
- 下一步应该怎么拆。

## 4. 模块完整研究

## 4.1 登录 / 注册 / OAuth / 路由

### 更新内容

该模块包含四类更新：

1. 登录/注册页配置泄露修复。
2. 登录后 Not found、右上角用户状态刷新修复。
3. OAuth popup/callback/layout 页面。
4. sign-in/sign-up/sign-modal/sign-user/social-providers/verify-email 等登录组件调整。

### 差异状态

来自文件级对比：共 19 个路径。

- 两边都有但内容不同：10 个。
- 当前项目缺失：4 个。
- diff-files 缺失：4 个。
- 两边都缺失：1 个。

当前项目缺失：

- `src/app/[locale]/(oauth)/auth-callback/page.tsx`
- `src/app/[locale]/(oauth)/auth-popup/page.tsx`
- `src/app/[locale]/(oauth)/layout.tsx`
- `src/shared/blocks/sign/sign-up-form.tsx`

`diff-files` 缺失但 2026 更新提到：

- `src/app/[locale]/(auth)/sign-in/page.tsx`
- `src/app/[locale]/(auth)/sign-up/page.tsx`
- `src/shared/blocks/common/locale-selector.tsx`
- `src/shared/services/settings.ts`

两边都缺失：

- `src/middleware.ts`

### 价值

- 登录/注册配置泄露修复属于安全修复，价值高。
- 登录状态刷新和路由修复属于稳定性修复，价值高。
- OAuth popup 支持有价值，但只有明确需要 popup 登录流时才必要。

### 风险

- diff-files 并没有完整包含登录/注册配置泄露修复相关文件，不能只依赖 diff-files。
- Auth 组件和当前项目登录体验可能有本地定制，不能整体替换。
- middleware 在当前对比里两边都缺失，需要另查来源，不应凭空补。

### 后续报告必须表达

建议把该模块拆成三类：

1. 登录/注册配置泄露修复：建议优先追溯 2026 源更新并人工合并。
2. 登录状态/locale/middleware 修复：建议核对当前项目是否已用其他方式实现，再决定是否补。
3. OAuth popup：可选更新，不作为第一优先级。

## 4.2 AI 生图 / AI 任务链路

### 更新内容

该模块覆盖：

- AI generate/query/providers 接口。
- dispatch/notify 异步任务分发和回调。
- retry-r2 存储重试。
- AI extension 类型和 provider/custom 入口。
- AI task model/status/log/mock/showcase/concurrency/dispatch。
- generator image/music/video 调整。
- demo 图片和 image-generator-examples。
- 积分校对、任务状态刷新、queued/pending/失败处理等。

### 差异状态

文件级补充清单中该模块共 19 个路径：

- 两边都有但内容不同：5 个。
- 当前项目缺失：14 个。

当前项目缺失集中在：

- demo 图片素材。
- `src/app/api/ai/storage/retry-r2/route.ts`
- `src/extensions/ai/custom.ts`
- `src/shared/services/ai_task_concurrency.test.ts`
- `src/shared/services/ai_task_mock.ts`
- `src/shared/services/ai_task_showcase.ts`

两边都有但不同集中在：

- `src/app/api/ai/providers/route.ts`
- `src/extensions/ai/index.ts`
- `src/extensions/ai/types.ts`
- `src/shared/blocks/generator/music.tsx`
- `src/shared/blocks/generator/video.tsx`

原始 2026 更新中还包含 dispatch、notify、generate、query、image-generator-examples、image.tsx、image-generation、ai_task_dispatch/status/log/model 等文件，这些在原分析中已有覆盖，最终报告也必须纳入该模块，而不能只看缺失清单的 19 个路径。

### 价值

- AI 任务链路是功能价值最高的部分之一。
- dispatch/notify/status/query 能改善异步任务可靠性、回调、超时、刷新、失败处理。
- 积分校对和任务状态修复会影响用户资产和任务体验。

### 风险

- 这是架构级更新，不是单文件补丁。
- 直接搬会牵连数据库、任务状态机、provider/channel、存储、回调、安全 token、前端轮询。
- 当前项目已有风控/审核逻辑，不能用 diff-files 版本直接覆盖生成链路。
- demo 图片和示例轮播属于展示增强，不应和核心任务链路混在一起更新。

### 后续报告必须表达

该模块应该拆成：

1. AI 核心 API 与任务状态修复：建议评估并人工合并。
2. dispatch/notify 异步队列：建议单独立项，不能直接搬。
3. 积分和状态校对：建议优先核查。
4. generator UI 和 demo 图片：可选，不建议覆盖当前生成器 UI。
5. mock/showcase/test 辅助能力：按是否采用新任务链路决定。

## 4.3 Activity 任务页 / 下载页 / 任务结果体验

### 更新内容

该模块包括：

- `activity/ai-tasks/page.tsx`
- `activity/ai-tasks/[id]/refresh/page.tsx`
- `activity/ai-tasks/[id]/download/page.tsx`
- `activity/ai-tasks/[id]/download/download-client.tsx`
- activity layout

主要变化是任务列表、任务刷新、下载页、结果展示、失败状态、queued/pending 处理。

### 差异状态

在原始分析中，下载页被识别为当前项目缺失；在页面/主题/内容模块中，activity layout 有差异。该模块与 AI 任务链路强相关，不能单独只看页面。

### 价值

- 下载页和结果增强对用户体验直接有价值。
- 相比完整 AI 队列重构，这部分更容易拆出来做。

### 风险

- 页面可能引用当前项目没有的 `ai-task-media`、`ai-task-error` 等辅助模块。
- 如果底层任务状态模型不同，直接搬页面会出现状态不匹配。

### 后续报告必须表达

建议作为可拆分功能评估：可以优先补下载页和结果展示，但必须基于当前项目现有任务 API 适配，不直接搬整套 activity 实现。

## 4.4 Admin 后台

### 更新内容

Admin 更新不是只有 AI 后台仪表盘，完整覆盖至少包括：

1. AI 图片后台仪表盘：
   - ai-image-dashboard client
   - trend charts
   - failed tasks
   - tasks page
   - page.tsx

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
   - `src/core/rbac/permission.ts`
   - `src/shared/lib/admin-content.ts`
   - `src/shared/services/admin-dashboard.ts`
   - `src/shared/services/admin-ai-image-dashboard.ts`
   - `src/shared/blocks/admin/ai-provider-settings-card.tsx`

### 差异状态

文件级补充清单中 Admin 模块共 28 个路径：

- 两边都有但内容不同：19 个。
- 当前项目缺失：9 个。

当前项目缺失集中在：

- AI image dashboard 页面和图表。
- AI tasks overview charts。
- dashboard-client。
- admin provider settings card。
- admin-content。

两边都有但不同集中在：

- admin 普通管理页面。
- prompts/showcases/users/settings/categories。
- dashboard 组件。
- RBAC permission。

### 价值

- Admin 后台包含运营和管理能力，价值不低。
- AI image dashboard 可帮助观察任务量、失败任务、趋势和 provider 使用情况。
- prompts/showcases/users/settings 的差异可能包含 bug fix、权限修正、字段变化、表单行为变化。
- RBAC 权限变化可能影响后台安全边界。

### 风险

- 后台页面通常和当前项目业务字段、数据结构、权限模型强绑定。
- AI 后台仪表盘依赖完整 AI task/provider/channel 数据，若底层未升级，直接接入价值有限。
- 普通后台页面直接覆盖可能破坏当前 prompts/showcases/users/settings 的定制字段和交互。
- provider settings card 可能依赖当前项目没有的 admin API 闭环。

### 后续报告必须表达

Admin 要拆成四类建议：

1. RBAC/权限/安全相关：建议优先人工核查。
2. 普通后台页面 bug fix：建议逐页 diff 后选择性合并。
3. AI 图片后台仪表盘：建议在 AI 任务链路稳定后再接。
4. 后台 UI 框架组件：不建议整体覆盖，只吸收明确 bug fix。

## 4.5 支付 / Paypal / Stripe / 订单 / 依赖

### 更新内容

该模块覆盖：

- Paypal 订阅扣费。
- Stripe/Paypal payment extension。
- checkout/callback 接口。
- callback token 加固。
- payment service。
- order model。
- callback route test。
- package.json / pnpm-lock.yaml。
- pricing locale/theme 的支付相关联动。

### 差异状态

文件级补充清单中该模块共 7 个路径：

- 两边都有但内容不同：5 个。
- 当前项目缺失：1 个。
- diff-files 缺失：1 个。

当前项目缺失：

- `src/app/api/payment/callback/route.test.ts`

`diff-files` 缺失：

- `src/extensions/payment/stripe.ts`

两边都有但不同：

- `package.json`
- `pnpm-lock.yaml`
- `src/extensions/payment/paypal.ts`
- `src/shared/models/order.ts`
- `src/shared/services/payment.ts`

原始 2026 更新还包含 checkout/callback route 和 pricing 相关文件，最终报告必须纳入。

### 价值

- 支付回调 token 加固价值高。
- Paypal 订阅扣费如果当前业务需要，是明确功能增量。
- 依赖安全修复与 Vercel 部署修复有基础设施价值。

### 风险

- 支付不能整体复制，必须逐路径人工合并。
- 当前项目定价结构、订单模型、支付 provider、回调行为可能已经定制。
- lockfile 和 package 更新可能影响全项目。
- Stripe 文件在 diff-files 中缺失，说明 diff-files 不能覆盖完整支付更新。

### 后续报告必须表达

建议优先评估支付回调 token 和安全/部署依赖修复；Paypal 订阅按业务需要决定；支付文件必须人工合并并单独验证，不能整体覆盖。

## 4.6 存储 / R2 / 上传

### 更新内容

该模块覆盖：

- R2 endpoint/account 配置方式调整。
- R2 错误信息解析增强。
- storage service。
- upload-image route。
- ai storage retry-r2 route。

### 差异状态

文件级补充清单中该模块共 2 个路径：

- `src/app/api/storage/upload-image/route.ts`：两边都有但不同。
- `src/shared/services/storage.ts`：两边都有但不同。

原始 2026 更新和原分析还涉及：

- `src/extensions/storage/r2.ts`
- `src/app/api/ai/storage/retry-r2/route.ts`

其中 retry-r2 当前项目缺失。

### 价值

- R2 配置和错误信息属于稳定性增强。
- 如果当前项目使用 R2，这部分建议优先核查。
- retry-r2 对 AI 图片存储失败恢复有价值。

### 风险

- upload-image route 涉及登录、文件数量、大小、MIME allowlist 等安全策略。
- 原分析指出 diff-files 可能存在放宽上传限制的倾向，不能直接覆盖上传策略。

### 后续报告必须表达

建议吸收 R2 配置/错误解析/storage 稳定性修复，但不建议放宽当前上传接口权限和限制。retry-r2 应和 AI 任务链路一起评估。

## 4.7 多语言 / 文案

### 更新内容

该模块覆盖大量 en/zh 文案，包括：

- activity ai-tasks/sidebar
- admin ai-tasks/dashboard/prompts/settings/showcases/sidebar
- ai chat/image/music/video
- common
- landing
- pages blog/create/hairstyles/index/pricing/showcases/updates
- settings sidebar
- locale index

### 差异状态

文件级补充清单中该模块共 44 个路径：

- 两边都有但内容不同：42 个。
- 当前项目缺失：2 个。

当前项目缺失：

- `src/config/locale/messages/en/admin/dashboard.json`
- `src/config/locale/messages/zh/admin/dashboard.json`

从 JSON 差异看，很多文件不是少量 key，而是大量 key 增删和值变化，pricing、landing、index、showcases、ai/image、admin/settings 等差异尤其大。

### 价值

- 新功能需要对应文案 key，否则页面不可完整运行。
- pricing 国际化校准可能属于 bug fix。
- admin/dashboard 缺失文案会影响新增后台页面。

### 风险

- 多语言文件混有大量品牌、营销、页面内容，不适合整体覆盖。
- 当前项目文案可能已经按 ChatGPT Image 2 定制，覆盖会破坏产品表达和 SEO。
- locale key 需要跟实际采用的功能同步，不应该独立大规模替换。

### 后续报告必须表达

多语言建议按功能同步 key：采用哪个功能，就同步对应最小文案 key。pricing bug fix 可以单独核查。不要整体覆盖 en/zh messages。

## 4.8 页面 / 主题 / 内容

### 更新内容

该模块覆盖：

- landing 页面。
- pricing/create/showcases/activity/settings 页面。
- ai-image-generator 页面。
- themes default blocks：blog/blog-detail/cta/faq/features/social-avatars/layout 等。
- content docs/logs/pages/posts。
- privacy-policy、terms-of-service、what-is-xxx 等内容。
- global.css/theme.css 等样式。

### 差异状态

文件级补充清单中该模块共 33 个路径：

- 两边都有但内容不同：28 个。
- 当前项目缺失：4 个。
- diff-files 缺失：1 个。

当前项目缺失：

- `content/logs/v1.0.mdx`
- `content/logs/v1.0.zh.mdx`
- `content/logs/v2.0.mdx`
- `content/logs/v2.0.zh.mdx`

`diff-files` 缺失：

- `src/shared/blocks/console/layout.tsx`

### 价值

- Activity 下载页、pricing 国际化、部分页面 bug fix 有价值。
- content logs 如果当前项目需要 changelog，可作为内容能力补充。
- 某些布局修复可能改善个人中心或页面结构。

### 风险

- 这是最容易覆盖当前项目本地 UI 的区域。
- 当前项目已有 homepage、header、footer、hero、pricing、generator、my works、showcase flows 等定制。
- 法务、博客、docs、营销文案不是通用补丁。
- 主题 blocks 直接覆盖会改变视觉和品牌表达。

### 后续报告必须表达

页面/主题/content 不建议整体更新。只允许拆出明确 bug fix 或新功能所需页面，比如 Activity 下载页、pricing 校准、settings 布局修复。法务/博客/docs/主题 blocks 应默认不跟。

## 4.9 数据库 / Schema / 预制数据

### 更新内容

该模块覆盖：

- schema.mysql.ts
- schema.postgres.ts
- schema.sqlite.ts
- prompt_rows.sql
- showcase_rows.sql

可能涉及：

- Showcase 公开/私有字段。
- AI task 相关字段。
- prompts/showcases 预制数据。

### 差异状态

文件级补充清单中预制数据共 2 个路径：

- `db/prompt_rows.sql`：当前项目缺失。
- `db/showcase_rows.sql`：当前项目缺失。

schema 文件在原始对比中是不同，但原 diff-analysis 已经指出 schema/auth/风控不建议直接替换。

### 价值

- 预制 prompt/showcase 数据可以作为内容初始化参考。
- Showcase public/private 控制是合理功能。
- AI 任务链路如果升级，schema 可能必须配套调整。

### 风险

- 数据库 schema 是高风险区域，不能直接覆盖。
- 当前项目已有风控/审核/生成链路相关结构，替换 schema 可能破坏现有逻辑。
- SQL 预制数据不等于迁移脚本，不能直接执行到生产。

### 后续报告必须表达

schema 只能按功能迁移，不能覆盖。预制 SQL 可作为参考数据，不建议直接执行。Showcase 可见性和 AI task schema 应分别立项。

## 4.10 项目配置 / 依赖 / README / skills / 辅助文件

### 更新内容

该模块覆盖：

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

### 差异状态

文件级补充清单中该模块共 4 个路径：

- `.gitignore`：两边都有但不同。
- `eslint.config.mjs`：当前项目缺失。
- `README.md`：diff-files 缺失。
- `public/preview.png`：两边都缺失。

原始 2026 更新还包含 next.config、tsconfig、package、lockfile、Claude skills。

### 价值

- package/lockfile 可能包含安全修复、部署修复、Paypal 依赖。
- next.config 可能包含 OAuth COOP header 或部署相关调整。
- eslint.config 可能是 lint/tooling 迁移。
- skills 只影响辅助工作流，不影响线上功能。

### 风险

- package/lockfile 影响全项目，不能为了某个功能盲目升级。
- next.config/tsconfig 影响构建、路由和类型行为。
- README/preview 属于文档和展示资产，不应影响业务更新判断。

### 后续报告必须表达

配置依赖要分开判断：安全/部署修复可优先核查；功能依赖随功能引入；skills/README/preview 可低优先级或不处理。

## 5. 最终报告的建议分类标准

最终报告不应只写 P1/P2/P3，而应使用更可执行的分类：

1. **建议优先更新**：安全、稳定性、低耦合基础设施修复。
2. **建议选择性更新**：功能价值明确，但需要按当前项目适配。
3. **建议单独立项**：架构级或数据库级改造，不能直接搬。
4. **暂不建议更新**：会覆盖当前 UI、文案、品牌、本地定制，或收益不明确。
5. **仅作为参考**：预制数据、demo 素材、README、skills 等。

## 6. 初步完整分层，不作为最终报告

### 6.1 建议优先更新或核查

- 登录/注册配置泄露修复。
- 登录状态刷新、Not found、locale-selector、sign-user 相关修复。
- 支付回调 token 加固。
- R2 endpoint/account 配置和 storage 错误处理。
- 依赖安全/部署修复，尤其 package/lockfile 中和 CVE/Vercel/Cloudflare 相关部分。
- RBAC/权限相关后台差异。
- AI 积分扣减、任务状态查询、失败处理等安全/资产相关逻辑。

### 6.2 建议选择性更新

- 公共 Prompts 页面。
- Activity 下载页 / 任务结果增强。
- Admin prompts/showcases/users/settings/categories 的明确 bug fix。
- Admin dashboard 基础数据展示，如果依赖可以闭合。
- pricing 国际化校准。
- settings/个人中心布局修复。
- R2 retry route，如果 AI 存储失败恢复确实需要。

### 6.3 建议单独立项

- AI 异步任务队列 dispatch/notify/status/log 全链路。
- AI 图片后台仪表盘和失败任务统计。
- Showcase 公开/私有可见性控制。
- 数据库 schema 迁移。
- Paypal 订阅扣费完整接入。

### 6.4 暂不建议整体更新

- landing 首页。
- themes default 下的 header/footer/hero/pricing/features/showcases/testimonials 等主题 blocks。
- content docs/posts/pages 法务和博客内容。
- 大量 locale 文案整体覆盖。
- generator UI 整体替换。
- 上传接口策略放宽。
- auth/schema/风控链路直接替换。

### 6.5 仅作为参考或低优先级

- demo 图片素材。
- image-generator-examples 展示轮播。
- README。
- preview.png。
- Claude skills。
- prompt_rows.sql/showcase_rows.sql 预制数据。

## 7. 最终报告必须覆盖的章节

后续 `diff-update-report-plan.md` 应至少规划这些章节：

1. 一句话结论。
2. 更新总览。
3. 按模块说明更新了什么。
4. 每个模块的差异状态和建议动作。
5. 建议优先级和实施顺序。
6. 不建议更新的范围。
7. 需要单独立项的范围。
8. 下一步任务拆分建议。

## 8. 关键约束

- 不能把最终报告写成旧 `chatgptimage2-diff-analysis.md` 的复制版。
- 不能漏掉后台、多语言、页面、配置、数据库、依赖等模块。
- 不能只说“人工合并”，必须说明为什么、合并哪类、避免覆盖哪类。
- 不能把文件清单无限展开成难读报告；文件清单应服务于决策。
- 报告必须能指导下一步工作：先做什么、暂不做什么、哪些要单独立项。
