# BUG 待修改清单（含代码定位）

共 27 条，均为本项目待核对/待修改项。代码定位基于 2026-10-27 对本仓库的静态探查。

## 高优先级索引

### P0（2 条，移动端核心可用性）
- BUG-19：移动端 /create 生成按钮被 FAQ 区块覆盖，60% 区域点击无响应 → seevideo-missing.css:630-632
- BUG-20：移动端生成按钮高度仅 36px，低于 44px 触控标准 → image.tsx:1609、video.tsx:1271/1288/1306

### P1（6 条，转化/一致性/稳定性）
- BUG-11：游客生成按钮误写为升级，点击弹登录框 → image.tsx:1605-1624、889-892；video.tsx:1302-1311
- BUG-12：切换视频模式后标题/说明/FAQ 不随模式切换 → create/page.tsx:27-46、image.tsx:1114-1156、video.tsx:796-806
- BUG-13：手机定价页年付标签被 50% OFF 徽标遮挡 + 横向溢出 → pricing-plans.tsx:682-712
- BUG-21：锁定模型无积分门槛标注，160 积分用不了 200 积分模型 → model-select.tsx:168-273、models.ts 回退积分矛盾
- BUG-22：/seedream4-5 宣传的模型系统里不存在 → seedream4-5/page.tsx:36、models.ts 无 seedream-4.5
- BUG-27：首页客户端异常整页白屏（根因未定）→ 渲染链嫌疑文件见 BUG-27 小节

## 详细清单

## BUG-1：生图入口问题
- 代码位置：
  - 首页 hero 主按钮跳 /create：src/themes/default/blocks/hero.tsx:58；CTA 区块对 '/create'/'#generator' 做滚动跳转：src/themes/default/blocks/cta.tsx:29；登录后引导：src/shared/blocks/sign/sign-user.tsx:361。
  - 生图主流程 handleGenerate：src/shared/blocks/generator/image.tsx:865-935 —— 无可用 provider（874-887）、未登录（889）、ultra 无订阅（894）、积分不足（899，英文硬编码 toast）、空提示词（905）、模型不支持场景（924-935，中文硬编码 toast）时都直接 return，用户看到的是「点了没反应」。

## BUG-2：生图按钮灰色
- 代码位置：
  - 图片生成按钮 disabled={isGenerating}：src/shared/blocks/generator/image.tsx:1608，无 loading 门控。
  - 视频生成器的灰色 disabled 逻辑（对照组）：src/shared/blocks/generator/video.tsx:1267-1288；isCheckSign 未就绪占位：video.tsx:1267-1275；image.tsx:297/305 定义了 isMounted/isCheckSign 但未用于按钮。两套按钮行为不一致。

## BUG-3：Seedance 2.5 首帧/首末帧仅支持自适应宽高比，但无「自适应」选项
- 代码位置：
  - seedance-2-5 配置：src/shared/blocks/generator/models.ts:484-509（ratioField='aspect_ratio'、firstFrameField/lastFrameField :502-503）。
  - 提交逻辑：src/shared/blocks/generator/video.tsx:662-665 无条件提交用户所选 aspectRatio；:647-658 首帧/尾帧提交（尾帧与参考图共用同一张 singleVideoImage.url，无独立尾帧上传）。
  - 结论：「按首帧图比例自适应」的代码完全不存在，属于未实现状态。

## BUG-4：生成视频问题（细节缺失）
- 代码位置：主流程 src/shared/blocks/generator/video.tsx:573-713（模型/渠道选择 :595-619，options 组装 :647-683，POST /api/ai/generate :692-706，轮询 /api/ai/query :443）；API 实现 src/app/api/ai/generate/route.ts、src/app/api/ai/query/route.ts。
- 待办：该条需向朋友要补充细节（复现步骤/截图），否则无法定位到具体缺陷。

## BUG-5：生成视频的参考图片只能上传一张
- 代码位置：src/shared/blocks/generator/video.tsx:255-258（状态用单值对象 singleVideoImage 而非数组）、:408-421（handleSingleVideoImageChange 只取 files[0]）、:900-973（上传 UI 只有单槽位）、:647-658（提交只引用 singleVideoImage.url）。
- 注意：models.ts 中多个模型配置了 imageInputMultiple: true（如 veo-3-1-premium :660、pixverse-v6 :607、gemini-omni-flash-1-1 :370），是前端结构把上限卡死为 1 张。

## BUG-6：视频比例只有两种
- 代码位置：
  - 全量比例常量 RATIO_OPTIONS（8 种）：src/shared/blocks/generator/models.ts:947-961。
  - 各视频模型用 ratioOptions 裁剪：veo-3-1-premium models.ts:655 只有 ['16:9','9:16']，gemini-omni-flash-1-1 :364、gemini-omni :393、veo-3-1-lite :686 同。
  - 生成器按模型配置过滤渲染：video.tsx:293-301（availableRatioOptions）、:1044-1074。

## BUG-7：视频预览 hover 才播放 + 提示词遮挡画面
- 代码位置：src/themes/default/blocks/showcases-flow-dynamic.tsx:244-254 —— 卡片只渲染封面图（LazyImage），全仓库没有 onMouseEnter/autoplay 的 hover 播放实现；hover 时 :250 出现 from-black/78 全覆盖渐变 + :251-254 提示词层盖住画面。
- 其他视频展示位同样无自动播放：src/app/[locale]/(landing)/settings/my-works/my-works-client.tsx:61-66,178-185；生成结果预览 video.tsx:1336-1341。

## BUG-8：导航栏点不动
- 代码位置：
  - src/themes/default/blocks/header.tsx:197-211 —— 桌面端带子菜单的导航项是「没有 onClick 的 button」，弹层纯靠 CSS group-hover，触屏/无 hover 环境完全无法点开。
  - 链接配置：src/config/locale/messages/en/landing.json:22-39，其中 "Seedance Prompts" → /seedance-prompts 在 src/app/[locale]/(landing) 下无对应路由，只能落入 catch-all 动态页（可能 404）。
  - 假象来源：src/shared/blocks/common/locale-detector.tsx:88-95 会自动 router.replace 换语言，切换瞬间可能像「点不动」。

## BUG-9：没有积分消耗预览（无法比价）
- 代码位置：
  - 生成器底部已有积分展示：video.tsx:325-345（costCredits 计算）、:1252-1266（credits_required 展示）；image.tsx:447-459、:483、:1595 附近。折扣规则：src/shared/lib/plan-credits.ts:113-150。
  - 缺口：模型选择器 src/shared/blocks/generator/model-select.tsx:168-273 的模型卡片不展示每个模型所需积分，无法横向比价（与 BUG-21 同源）。

## BUG-10：首页选生成图片后点 generate 跳错页 / image 页面点不动
- 代码位置：
  - src/shared/blocks/common/prompt-showcase.tsx:340-360 —— handleGenerate 只派发 CustomEvent 'prompt-showcase:generate'，事件 detail.mode 被接收方忽略。
  - src/app/[locale]/(landing)/landing-generator-toggle.tsx:42-53 —— 渲染哪个生成器只由 config.workbenchGenerator 决定（首页固定 'image'，src/config/landing-pages.ts:40），完全不看用户选的模式。
  - src/shared/blocks/generator/image.tsx:377-386 —— ImageGenerator 内部把 mediaMode 强制重置为 'image'。
  - 导航栏 Image 链接 → /ai-image-generator（landing.json:31），该页 lockedMode=true（landing-pages.ts:69-93），工作台隐藏模式切换。代码内无 router.push('/ai-video-generator')，线上「跳到生视频」需怀疑 DB 动态落地页或部署配置。

## BUG-11：P1｜游客生成按钮误写为升级
- 代码位置：
  - 图片生成器游客按钮三态：src/shared/blocks/generator/image.tsx:1605-1624 —— !user 时渲染 LockKeyhole + t('workbench.upgrade_to_generate')；游客点击 handleGenerate（image.tsx:889-892）直接 setIsShowSignModal 弹登录框。
  - 视频生成器游客按钮：video.tsx:1302-1311 —— 文案是硬编码英文 "Upgrade to Generate"，连 t() 都没用。
  - 改法方向：未登录显示「登录开始生成」类文案，登录后按积分/套餐显示对应动作。

## BUG-12：P1｜切换视频模式后标题/说明/FAQ 不随模式切换
- 代码位置：
  - 标题：image.tsx:1114-1136（workbench.title_* 文案）、:1153-1156（mode_locked_image "AI IMAGE GENERATOR"）；video.tsx:796-806 有自己的标题，但两套互不响应页面级模式状态。
  - FAQ：src/app/[locale]/(landing)/create/page.tsx:27-46 —— FAQ 取自 landing 命名空间 faq.*（ChatGPT Image 2 主题，src/config/locale/messages/en/landing.json:360-390），页面级静态渲染，与生成器 mediaMode 无关联；渲染组件 src/themes/default/blocks/faq.tsx:13。

## BUG-13：P1｜手机定价页年付标签被「50% OFF」徽标遮挡 + 横向溢出
- 代码位置：src/themes/default/blocks/pricing-plans.tsx:691-696 —— 徽标 absolute -right-1 -top-2.5 负偏移叠在 Tab 右上角；切换区 :682-712 外层无 overflow-x 处理，Tab whitespace-nowrap px-3 py-2，移动端 3 个 Tab 加徽标即溢出。
- 文案：en/pages/pricing.json:26 "save 50%"（zh "节省50%"）。另导航 "Pricing" 项的 50% OFF 徽标在 en/landing.json:40（另一处）。

## BUG-14：P2｜AI 提示词按钮点击无反馈
- 代码位置：src/shared/blocks/generator/image.tsx:1372-1380 —— Sparkles 图标按钮只设置了 aria-label，没有任何 onClick 处理函数，点击必然无反应。需补齐功能或加载/登录/失败提示。

## BUG-15：P2｜英文模型卡片混入中文 + Runway 图标破损
- 代码位置：
  - 回退逻辑：src/shared/blocks/generator/model-select.tsx:225（badges）、:243（description）、:249（capabilities）—— dict.models[model.id] 取不到时回退 models.ts 的中文字段。
  - 数据：models.ts:916-938 —— runway-gen-4 的 badges:['新']、description、capabilities 全是中文；en/zh 两份 ai/models.json 都没有 runway-gen-4 这个 key（en 字典止于 grok-imagine-video，:406-416），英文界面必然回退显示中文。
  - 图标：models.ts:919 icon='/model_icon/runway-icon.svg'（public/model_icon/ 下），渲染 model-select.tsx:119-123/209-213。需检查该文件是否存在/路径是否对。

## BUG-16：P2｜提示词库搜索无匹配却提示内容库为空
- 代码位置：
  - 空状态 UI：src/themes/default/blocks/showcases-flow-dynamic.tsx:301 —— 兜底硬编码英文 "No items found in this category."，未走 i18n。「No Seedance 2.5 prompts yet」文案在本仓库不存在（线上另一版本/DB 产出）。
  - 根因已确认：前端 :93-104 把 searchTerm 拼进 /api/showcases/latest 请求；但 src/app/api/showcases/latest/route.ts:25-30 的 usePrompts 分支调用 getPrompts({ page, limit, status }) 时根本没有传 searchTerm（searchTerm 只在 showcases 分支 :53-59 使用）—— 提示词库搜索从未生效，结果恒为全量或空。
  - /seedance-prompts 无专属路由，靠 catch-all 兜底（见 BUG-24 的 catch-all 说明）。

## BUG-17：P2｜图片生成中结果区仍显示 No preview
- 代码位置：src/shared/blocks/generator/image.tsx:1644-1710 —— 预览区只有三态（有图/示例图/No preview :1705），没有 isGenerating 加载态；且 handleGenerate 提交时 :943 setGeneratedImages([]) 清空旧结果，提交后到出图前一直显示 "No preview"。

## BUG-18：P2｜中文工作台主要生成按钮未翻译
- 代码位置：src/config/locale/messages/zh/ai/image.json:141 与 zh/ai/video.json:71 —— "upgrade_to_generate" 仍是英文 "Upgrade to Generate"（en 版分别在 en/ai/image.json:141、en/ai/video.json:71）；叠加 BUG-11 的状态歧义。

## BUG-19：P0｜移动端 /create 生成按钮被 FAQ 区块覆盖，60% 区域点击无响应
- 代码位置：src/config/style/seevideo-missing.css:630-632 —— .workbench-main { height: calc(100dvh - 4rem) }，无任何移动端媒体查询覆盖；使用处 image.tsx:1113、video.tsx:793（main 自身 overflow-y-auto，外层容器 :1111/:791 overflow-hidden → 双层滚动）。body.generator-workbench-active 隐藏 footer 规则在同 css:653-655。
- 修法参考：移动端高度改 auto + 去纵向裁切，统一 body 单层滚动（与 BUG-26 同一改动）。

## BUG-20：P0｜移动端生成按钮高度仅 36px，低于 44px 触控标准
- 代码位置：h-9 共 4 处生成主按钮 —— image.tsx:1609（图片生成，即 BUG-11 按钮）、video.tsx:1271（加载中占位）、:1288（登录态生成）、:1306（游客按钮）。修法：移动端 h-11，桌面保持 md:h-9。

## BUG-21：P1｜锁定模型无积分门槛标注，160 积分用不了 200 积分模型
- 代码位置：
  - 模型回退积分与定价页不一致：models.ts:642-671（veo-3-1-premium，回退 120，:670）、:842-865（kling-2-1-master，回退 100，:864）；真实基准积分来自 plan-credits.ts:95-102 getBaseCredits()，数据源 en/pages/pricing.json:786-798（Veo 3.1 Premium 原价 200）、:969-981（Kling 2.1 Master 200）。注意 starter-monthly=null 时 getBaseCredits 返回 null，前端落到 models.ts 回退值 120/100，与定价页 200 矛盾。
  - 无积分展示：model-select.tsx:168-273 卡片不展示所需积分。
  - 拦截方式：image.tsx:899-902、video.tsx:579-581 —— toast.error('Insufficient credits…') 后 return，不弹定价窗。
  - Trial 160 无代码常量：注册赠送积分由 DB 配置（settings.ts:347-364，默认 false/0），发放 credit.ts:324-349 grantCreditsForNewUser()；同 IP 前 5 个账号限制 core/auth/config.ts:120-127（即 BUG-23 的「同 IP 限领」来源）。
- 建议：模型卡片标注所需积分，余额不足灰显+升级引导（或调 Trial 额度）；统一 models.ts 回退值与 pricing.json。

## BUG-22：P1｜/seedream4-5 宣传的模型系统里不存在
- 代码位置：src/app/[locale]/(landing)/seedream4-5/page.tsx:36 —— <ImageGenerator> 未传 defaultModel；models.ts 中无 seedream-4.5（只有 seedream-4 :133、seedream-5-lite :114）。
- 更深一层：全仓库没有任何页面传过 defaultModel；ImageGenerator 声明了该 prop（image.tsx:55、:255）但从未使用，初始 model 固定取 image.tsx:273 MODEL_OPTIONS[0]（'gpt-image-2-image-to-image'）。修复时要么给 ImageGenerator 实现 defaultModel 生效逻辑，要么改页面文案与实际默认模型一致。/z-image 页面（z-image/page.tsx:36）写法相同，其「修复」指接入 KIE z-image 渠道（image.tsx:148 'fal-ai/z-image/turbo'）而非 defaultModel 机制。

## BUG-23：P2｜积分为 0 时无原因说明与升级路径
- 代码位置：
  - 积分页 src/app/[locale]/(landing)/settings/credits/page.tsx:120-145 —— 只显示余额+流水+跳 /pricing 按钮，无「为什么是 0」说明；billing/profile 页无任何积分内容。
  - 「积分不足弹定价窗」在本工作区不存在：image.tsx:899-902/video.tsx:579-581 只有 toast；弹 PricingDialog 的仅有 image.tsx:894-897（ultra 无订阅）和 model-select.tsx:93-99（点锁定模型）。PricingDialog 组件在 src/shared/blocks/generator/pricing-dialog.tsx。
  - 0 积分成因：同 IP 限领（core/auth/config.ts:120-127）+ DB 配置 initial_credits 默认关闭（settings.ts:347-364）。

## BUG-24：P2｜/seedance-2-free 落地页生成入口过深
- 代码位置：本仓库不存在该页面 —— src/app 下无 seedance 目录，content/pages 无 mdx，messages/pages 无 json，全仓库无 "seedance-2-free" 字符串；唯一能承接该 URL 的是 catch-all src/app/[locale]/(landing)/[...slug]/page.tsx:95-143（查 mdx → 查 pages.* 消息 → 否则 notFound，不查库）。
- 结论：该路由在本代码库当前必然 404，页面缺失本身可能就是根因；需先确认线上该页内容来源（旧版本/DB），再决定是否新建页面 + 首屏锚点按钮。同类页面结构参考 seedream4-5/page.tsx（features→generator→faq）。

## BUG-25：P3｜移动端首屏 TTFB 1.7–3.1 秒
- 代码位置：
  - HTML 543KB 主嫌疑：src/core/i18n/request.ts:47-68 —— 一次加载全部 61 个命名空间（清单 src/config/locale/index.ts:18-61，单语言约 288KB），src/app/[locale]/layout.tsx:28 的 NextIntlClientProvider 未做 messages 过滤，全量序列化进 HTML。
  - TTFB：src/app/[locale]/(landing)/page.tsx:7-8 dynamic='force-dynamic' + revalidate=0，每次请求跑 landing-page-renderer.tsx:36-49 的 getUserInfo/getCurrentSubscription/getLatestShowcases 三个 DB 查询 + root layout getAllConfigs（src/app/layout.tsx:73）。

## BUG-26：P2｜工作台双层滚动容器，移动端手势滚动错位
- 代码位置：与 BUG-19 同源 —— seevideo-missing.css:630-632（height calc 锁死）+ image.tsx:1113/video.tsx:793（main overflow-y-auto）+ 外层 :1111/:791 overflow-hidden。修法：移动端 height auto + overflow 可见，统一 body 单层滚动。

## BUG-27：P1｜首页客户端异常整页白屏（根因未定）
- 渲染链嫌疑文件（按链路）：
  1. src/app/layout.tsx:72-102,164-174 —— 生产环境从 DB 取配置注入 ads/analytics/affiliate/customer-service 第三方脚本（src/shared/services/ 下对应服务），脚本内容损坏即白屏；
  2. src/app/[locale]/layout.tsx:27-36 —— NextIntlClientProvider/ThemeProvider/AppContextProvider；
  3. src/shared/contexts/app.tsx —— 客户端 provider（auth fetch）；
  4. src/app/[locale]/(landing)/layout.tsx:28 —— LocaleDetector（useSearchParams + 自动 router.replace，可能循环跳转）；
  5. landing-generator-toggle.tsx（framer-motion AnimatePresence）→ prompt-showcase.tsx:263-279（IntersectionObserver）→ showcases-flow-dynamic.tsx:106（useEffect fetch /api/showcases/latest）。
- 下一步：按 BUG-27 原记录，保留故障标签页采集 Console 首条异常堆栈 + Network 失败请求，再对照上述链路定位。

## BUG-28：P0｜Unlimited 套餐付费后不发放积分
- 现象：用户购买 Unlimited 月/年套餐，支付成功、订阅生效，但赠送积分不到账（朋友站 Julia 实测案例，两分支共有）。
- 根因：套餐配置只有 `credits_label`（"赠送 15,000 / 90,000 SOTA 积分"文案）没有 `credits` 数值字段 → 创建订单 creditsAmount = pricingItem.credits = undefined → 数据库 credits_amount = NULL → 支付成功处理时无 creditsAmount 则跳过积分发放。
- 本项目证据：src/config/locale/messages/en/pages/pricing.json:195-198（premium-monthly 只有 credits_label "Unlimited points"）、:443-446（premium-yearly 同）；对比正常套餐（:110 credits:2500、:279/:357 credits:10000 等）均有 credits 字段。
- 附加注意（朋友站复盘结论）：
  1. 修复不只是补两个 JSON 字段——需排查自己订单表里 credits_amount 为 NULL 的已支付订单，制定补发策略；
  2. 存量 NULL 订单不能盲目全量回加，逐单核对支付记录，避免重复赠送；
  3. 历史上从有 credits 的套餐（如 5500/66000）切换到 Unlimited 的存量订阅用户，口径需单独核对。
