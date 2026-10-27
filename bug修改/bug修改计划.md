# Bug 修改计划（功能缺陷 28 条）

> 配套文档：BUG待修改清单.md（问题细节与代码定位）。本文件只写「怎么改」。
> 建议实施顺序：BUG-28（资金直损）→ P0 → P1 → QA 巡检类 → 早期问题类。

## BUG-28：Unlimited 套餐付费不发放积分（资金直损，最优先）
- 改法：
  1. pricing.json（en/zh 两份）给 premium-monthly（:195-198）和 premium-yearly（:443-446）补上 `credits` 数值字段（数值 = 运营口径：月 15,000 / 年 90,000，需确认）；同时全量扫描所有套餐，凡有 credits_label 无 credits 的一并补齐；
  2. 代码侧防御（防再犯）：checkout 路由（src/app/api/payment/checkout/route.ts）创建订单时校验 creditsAmount 为空则报错拒绝下单，而不是静默写 NULL；
  3. 发放侧（payment.ts handleCheckoutSuccess）对 NULL creditsAmount 的 PAID 订单打告警日志；
  4. 存量处理：SQL 排查 `orders where credits_amount is null and status='paid'`，逐单人工核对支付记录后决定补发（不写自动回加脚本，避免重复赠送）。
- 验收：测试环境购买 Unlimited 月套餐 → 支付成功 → 积分到账 + 积分流水生成；存量 NULL 订单清单已导出待运营核对。
- 验证方式（Stripe 测试模式）：
  1. 下单页选 Unlimited Monthly 走一次完整支付，支付成功后到 /settings/credits 确认到账 15000 且有一条 credits 流水；Unlimited Yearly 同理到账 90000。
  2. 防御校验：临时把 pricing.json 中 premium-monthly 的 credits 删掉再下单，预期 checkout 直接报错（pricing item … has no credits amount），不产生订单。
  3. 告警日志：把一笔已支付订单的 credits_amount 手工置 NULL 后触发 webhook，预期服务端日志出现 "has no creditsAmount, credits not granted"。
  4. 存量排查：执行 `select order_no, user_email, amount, created_at from orders where credits_amount is null and status = 'paid'`，导出清单交运营逐单核对。

## BUG-19 / BUG-26：移动端双层滚动 + 按钮被裁（P0，一个改动修两条）
- 改法：src/config/style/seevideo-missing.css 的 `.workbench-main`（:630-632）桌面端保留 `height: calc(100dvh - 4rem)`，新增移动端媒体查询：`@media (max-width: 767px) { .workbench-main { height: auto; overflow: visible; } }`，统一由 body 单层滚动。
- 注意：检查 image.tsx:1113 / video.tsx:793 的 main 上 `overflow-y-auto` 是否需要在移动端覆盖为 visible；顺带确认 :653-655 隐藏 footer 规则不受影响。
- 验收：390×844 视口下 /create 页面按钮完整可见、可点击，页面只有一条滚动条。
- 验证方式：Chrome DevTools 切 390×844（或真机）打开 /create —— ① 生成按钮完整出现在视口内，点击有响应（弹登录框/开始生成）；② 整页只有 body 一条滚动条，无内层独立滚动；③ 桌面端（≥768px）打开 /create，工作台仍为固定高度内部滚动，布局与改前一致。

## BUG-20：生成按钮移动端高度不足（P0）
- 改法：4 处生成主按钮 className 由 `h-9` 改为 `h-11 md:h-9` —— image.tsx:1609、video.tsx:1271、:1288、:1306。
- 验收：移动端按钮高度 ≥44px，桌面端视觉不变。
- 验证方式：390×844 视口下检查图片/视频生成器的主按钮（含加载占位、登录态、游客态三态），DevTools 量高度 ≥44px；≥768px 桌面端量高度仍为 36px 且外观不变。

## BUG-11 / BUG-18：游客按钮文案与中文翻译（P1，一起改）
- 改法：
  1. en/ai/image.json:141、en/ai/video.json:71 的 `upgrade_to_generate` 改为 "Sign in to Generate"；
  2. zh/ai/image.json:141 改为「登录后开始生成」、zh/ai/video.json:71 同步中文；
  3. video.tsx:1302-1311 游客按钮从硬编码英文改为 `t('workbench.upgrade_to_generate')`；
  4. 登录后按状态区分：积分充足 → 生成；积分不足 → 「积分不足，去充值」（可复用 PricingDialog）。
- 验收：游客见「登录后开始生成」；中文工作台全中文；登录用户按状态显示对应动作。
- 验证方式：
  1. 未登录打开 /create：图片/视频两个生成器按钮均为「Sign in to Generate / 登录后开始生成」，点击弹登录框。
  2. 登录 0 积分账号：按钮变为「积分不足，去充值 / Insufficient Credits - Top Up」，点击弹定价窗而非 toast 报错。
  3. 登录有积分账号：按钮恢复「Generate」，生成流程正常。
  4. 切中文界面重走 1-3，确认无 "Upgrade to Generate" 英文残留。

## BUG-12：模式切换后标题/FAQ 不同步（P1）
- 改法：
  1. 标题：video.tsx:796-806 已有视频标题，确认 image.tsx:1098-1106 切到 Video 后整树由 VideoGenerator 渲染即可自动切换；问题在 mode_locked 场景（image.tsx:1153-1156）与 /ai-image-generator lockedMode——给标题组件传入当前 mediaMode 而不是写死。
  2. FAQ：create/page.tsx:27-46 把静态 faq 改为随 mediaMode 选择 `landing.faq.image` / `landing.faq.video`（en/landing.json 需新增视频版 FAQ 内容，可先复用现有文案结构）。
- 验收：切到 Video 后标题、介绍、FAQ 均为视频主题，反之亦然。
- 验证方式：打开 /create 点模式切换到 Video：① 标题切为视频主题、切回恢复图片主题；② 页面底部 FAQ 同步切换为视频版四条（zh/en 各核对一遍）；③ /ai-image-generator（lockedMode）标题正确显示 AI IMAGE GENERATOR。

## BUG-13：定价页徽标遮挡 + 横向溢出（P1）
- 改法：src/themes/default/blocks/pricing-plans.tsx:691-696 徽标容器由 `absolute -right-1 -top-2.5` 改为不遮 Tab 文案的布局（如 `-top-2.5 right-2` 或徽标改到 Tab 内右上角、缩小字号）；切换区 :682-687 外层加 `max-w-full overflow-x-auto` 防溢出；移动端徽标可 `hidden sm:block` 仅保留 Tab 文案。
- 验收：390 宽视口下 Annual billing 标签完整可见，scrollWidth ≤ 视口宽。
- 验证方式：390 宽视口打开 /pricing：① Annual billing 标签完整可见、无徽标遮挡；② 切换区无横向溢出（滚动条不出现）；③ 桌面端徽标仍在 Tab 右上角正常展示。

## BUG-21：模型积分门槛标注（P1）
- 改法：
  1. model-select.tsx:168-273 模型卡片展示所需积分（数据用 plan-credits.ts getBaseCredits()，并顺带修 models.ts:670/:864 回退值 120/100 与 pricing.json 200 不一致的问题——回退值改成与 pricing.json 一致或去掉回退）；
  2. 余额不足的模型灰显（禁用态）+ 点击弹 PricingDialog（复用 model-select.tsx:93-99 锁定模型已有逻辑）；
  3. 是否把 Trial 提到 200 由运营决定，代码层先做标注+灰显。
- 验收：160 积分用户能看到 veo-3-1-premium 需 200 积分且灰显，点击引导升级而非报错。
- 验证方式：用 160 积分账号打开模型选择器：① 每个模型卡片显示所需积分（Veo 3.1 Premium 显示 200 credits，不再是回退值 120）；② 余额不足的模型灰显，点击弹定价窗而非报错；③ 余额充足账号选择这些模型正常生成。

## BUG-22：/seedream4-5 落地页模型不存在（P1）
- 改法（二选一，推荐 A）：
  - A. 给 ImageGenerator 实现 defaultModel：image.tsx:273 初始 model 改为 `defaultModel ? MODEL_OPTIONS.find(m => m.id === defaultModel) ?? MODEL_OPTIONS[0] : MODEL_OPTIONS[0]`，seedream4-5/page.tsx:36 传 `defaultModel="seedream-5-lite"`；
  - B. 修改页面宣传文案与实际默认模型一致。
  - 若决定做 seedream-4.5，需在 models.ts 新增模型配置 + 渠道确认，成本高，需另评估。
- 验收：从 /seedream4-5 进入生成器，默认选中模型与页面宣传一致。
- 验证方式：从 /seedream4-5 进入页面，工作台默认选中 Seedance 5 Lite；从 /create 与首页进入默认模型不变（仍为原默认）。

## BUG-27：首页白屏（P1，根因未定，先做防御）
- 计划：
  1. 拿到故障现场：按清单记录采集 Console 首条异常堆栈 + Network 失败请求；
  2. 代码侧防御：给 landing-generator-toggle / prompt-showcase / showcases-flow-dynamic 的数据获取与渲染加错误边界（React ErrorBoundary 包裹首页客户端组件，白屏降级为局部错误提示）；
  3. 排查第三方脚本：layout.tsx:72-102 DB 注入的统计脚本内容做服务端校验/白名单。
- 验收：拿到异常栈并修复；首页在刷新/导航场景无白屏。
- 验证方式（防御部分）：① 临时断开 showcases 接口或让其返回异常数据后打开首页，页面降级为局部错误提示 + Refresh 按钮，不再整页白屏；② 恢复后首页渲染正常。根因修复仍需按清单采集故障现场（Console 首条异常堆栈 + Network 失败请求），此项需人工操作。

## BUG-14：AI 提示词按钮无反馈（P2）
- 改法：image.tsx:1372-1380 给按钮绑定 onClick。两种方向：
  - 实现 AI 提示词优化：调用现有 AI 通道（复用生成器 provider）把用户输入改写为更优提示词，写回输入框，期间按钮转 loading；
  - 或暂未实现则隐藏该按钮（宁可没有也不要点了没反应）。
- 验收：点击后有 loading 且输入框内容更新；或按钮不再展示。
- 验证方式（已实现优化功能）：
  1. 登录后在输入框输入提示词（如 "a cat"），点击 Sparkles 按钮：按钮转 loading，几秒后输入框被改写为更详细的英文提示词，字符数不超过上限。
  2. 空输入时按钮置灰不可点；优化过程中不可重复点击。
  3. 服务端未配置 deepseek key 时（删掉 prompt_optimize_api_key 与 prompt_moderation_api_key 测试）：点击后按钮自动从界面消失，无报错弹窗。
  4. 未登录点击：弹登录框。接口断网/超时：toast 报「提示词优化失败」且按钮恢复可点。

## BUG-15：英文模型卡片混中文 + Runway 图标破损（P2）
- 改法：
  1. en/ai/models.json、zh/ai/models.json 补 `runway-gen-4` 条目（models.ts:916-938 的中文文案翻译成英文）；
  2. 检查 public/model_icon/runway-icon.svg 是否存在/路径正确，损坏则换源图；
  3. model-select.tsx:119-123/209-213 的 img 加 onError 回退图（占位图标）。
- 验收：英文界面搜 Runway 显示全英文 + 图标正常。
- 验证方式：
  1. 英文界面打开模型选择器搜 "runway"：卡片名称、描述、能力标签全英文（"Runway's next-gen video model..."），无中文残留。
  2. Runway 卡片左侧图标正常显示（runway-icon.svg 已补建）；DevTools Network 确认该 SVG 返回 200。
  3. 回退验证：临时把任一模型的 icon 路径改成不存在文件，打开选择器该卡片显示灰色占位脸图标而非破图；恢复后正常。

## BUG-16：提示词库搜索从未生效（P2）
- 改法：
  1. src/shared/models/prompt.ts getPrompts 增加 searchTerm 参数，查询加 title/description 的 ilike 过滤；
  2. src/app/api/showcases/latest/route.ts:25-30 usePrompts 分支把 searchTerm 传入 getPrompts；
  3. showcases-flow-dynamic.tsx:301 空状态区分「库为空」与「无匹配结果」：搜索态显示"没有匹配结果"+清空按钮，走 i18n。
- 验收：搜索存在的关键词返回结果；乱词显示"无匹配"且可一键清空。
- 验证方式：
  1. 在提示词库页面（带 searchTerm 的入口）搜索一个已知存在的标题关键词：返回匹配卡片；Network 面板确认 `/api/showcases/latest?...&searchTerm=...&usePrompts=true` 请求返回的是过滤后的子集。
  2. 搜索一个乱词（如 "zzzqqq"）：显示「没有与 "zzzqqq" 匹配的结果」+ 清空按钮，而非"No items found"；点击清空按钮恢复完整列表且 URL 上的 searchTerm 被移除。
  3. 英文界面重复 1-2，确认文案为 "No results for ..." / "Clear search"。
  4. 不带 searchTerm 的普通浏览：空库时仍显示原"No items found in this category."，行为不变。

## BUG-17：生成中结果区显示 No preview（P2）
- 改法：image.tsx:1644-1710 预览区增加 isGenerating 分支：显示骨架屏/进度文案（"生成中，已等待 X 秒"），替代 No preview；保留 :943 清空逻辑但仅在拿到新结果时替换。
- 验收：提交生成后结果区显示加载态而非 No preview，完成后展示图片。
- 验证方式：
  1. 提交一次正常生成：结果区立即显示「生成中...」+ 双骨架屏 + 「已等待 X 秒」计时（每秒递增），不再出现 No preview。
  2. 生成完成：骨架屏被生成的图片替换；失败时恢复原空态文案，计时停止。
  3. 中文界面文案为「生成中... / 已等待 X 秒」，英文为 "Generating... / Elapsed Xs"。

## BUG-08：导航栏点不动（P2）
- 改法：header.tsx:197-211 带子菜单的导航项：button 加 onClick 切换 open 状态（受控弹层），或改用 details/popover 兼容触屏；确认 /seedance-prompts 路由可达（结合 BUG-16 的页面，若无对应页先改链接指向已有提示词库路径）；locale-detector 自动跳语言逻辑加一次性 storage 标记避免反复跳转造成「点不动」假象。
- 验收：移动端/触屏可展开子菜单；各导航项点击可达目标页。
- 验证方式：
  1. 触屏/DevTools 触屏模式（或窄视口但 ≥lg 的平板尺寸）：点击带子菜单的导航项，弹层展开；再点一次收起；点击子项正常跳转且弹层关闭。
  2. 桌面端 hover 展开行为不变；点击也展开，无冲突。
  3. 点击各导航项（含无子菜单项）确认可达目标页；/seedance-prompts 实际访问一次确认 200（该路由由 [...slug] 动态页承接，需运行环境核对；404 则按计划改链到已有提示词库路径）。
  4. 语言跳转回路：LocaleSelector 已写偏好 storage（cacheSet('locale')），手动切换语言后刷新不会被自动跳回；如复现反复跳转再补一次性标记。

## BUG-10：首页生成模式跳转错误（P2）
- 改法：landing-generator-toggle.tsx:42-53 读取 CustomEvent detail.mode，Video 模式时渲染 VideoGenerator；或 prompt-showcase.tsx:340-360 直接 router.push('/create?mode=video') 并在 /create 初始化时读取 query。两处选一，避免 image.tsx:377-386 的强制重置冲突。
- 验收：首页切到 Video 后点 Generate 进入视频生成器；image 页面可直接进入。
- 验证方式：
  1. 首页提示词框切到 Video 模式，输入任意文字点 Generate：进入视频生成器（Text to Video 标签），不再是图片生成器。
  2. 切回 Image 模式点 Generate：进入图片生成器。
  3. 回归：/create 直接访问、/ai-image-generator（lockedMode）入口行为不变。

## BUG-07：视频预览体验（P2）
- 改法：showcases-flow-dynamic.tsx:244-254 卡片 hover 时把 <img> 换成 <video muted loop autoplay preload="metadata">（IntersectionObserver 控制播放），提示词层改为 hover 底部渐变内紧凑展示或默认半透明、hover 全显。my-works 与生成结果预览同步评估。
- 验收：悬停即播放且不挡画面主体。
- 改法补充说明：showcase 表原本没有视频字段，本次已补全链路 —— schema 增加 `video` 列（postgres/sqlite 两份，随 SEC-08 的 db:push 一并建列）、Showcase/NewShowcase 接口、API 返回、卡片 hover 播放（muted+loop+playsInline，preload=none，移出暂停）。
- 验证方式：
  1. 跑 `pnpm db:push` 后确认 showcase 表多了 video 列。
  2. 给任一 showcase 记录的 video 填一个公开可访问的 mp4 地址，刷新案例页：hover 该卡片时静音循环播放视频，移出即停；无 video 字段的卡片仍只显示图片。
  3. 悬停时提示词层展示与点击放大弹窗不受影响。
  4. 数据回填（运营动作）：批量给视频类 showcase 补 video 地址后逐卡片抽查。my-works 与生成结果预览的同步改造单独立项。

## BUG-09：模型选择器无积分对比（P2）
- 改法：与 BUG-21 同一处代码（model-select.tsx 卡片展示积分），一次改动同时满足两条。
- 验收：模型列表每项显示所需积分，可横向对比。

## BUG-03：Seedance 自适应宽高比（P3，需上游确认）
- 改法：models.ts:484-509 seedance-2-5 配置 firstFrame/lastFrame 模式下增加 'auto' 宽高比选项（RATIO_OPTIONS 或专属列表）；video.tsx:662-665 提交时 mode 为 auto 则不传 aspectRatio 字段（由上游按首帧自适应），需先确认 KIE/上游接口支持缺省行为。
- 验收：选择自适应后提交成功且出片比例与首帧一致。

## BUG-06：视频比例只有两种（P3）
- 改法：把 veo-3-1-premium（models.ts:655）、gemini-omni-flash-1-1（:364）、gemini-omni（:393）、veo-3-1-lite（:686）的 ratioOptions 扩到上游实际支持的档位（逐个核对各渠道 API 文档后放开，不要盲开）。
- 验收：各模型比例选项与上游支持范围一致。

## BUG-05：参考图只允许一张（P3）
- 改法：video.tsx:255-258 状态改数组、:408-421 支持多文件、:900-973 上传 UI 加多槽位、:647-658 提交 image_input 传数组；按模型 imageInputMultiple 配置决定上限（单图模型仍限 1 张）。
- 验收：支持多图的模型可传多张，单图模型行为不变。

## BUG-24：/seedance-2-free 页面缺失（P3，需先确认来源）
- 计划：先确认该 URL 线上内容由谁提供（旧版本/DB/另一个仓库）；若需在本仓库实现，参照 seedream4-5/page.tsx 结构新建页面（features → generator → faq），首屏加「立即生成」锚点按钮滚到 generator。
- 验收：/seedance-2-free 返回 200 且首屏有直达生成器的按钮。
- 已实施（方案 B）：新建 `src/app/[locale]/(landing)/seedance-2-free/page.tsx`（features → generator → faq 结构），en/zh 新增 pages/seedance2free.json 并注册进 localeMessagesPaths；顺带给 VideoGenerator 补了 defaultModel prop（BUG-22 同款），页面默认选中未锁定的 seedance-2-0-mini。
- 验证方式：
  1. 直接访问 /seedance-2-free：返回 200，页面含特性介绍、内嵌视频生成器与 FAQ；生成器默认选中 Seedance 2.0 Mini（可出片，非锁定模型）。
  2. 从页面内生成器提交一次生成，流程正常。
  3. 英文/中文界面各看一遍，文案完整无缺 key。
  4. 若运营确认该 URL 原本应由别处提供内容，再决定是否下线本页或调整默认模型。

## BUG-03：Seedance 自适应宽高比（P3，需上游确认）
- 状态：暂缓实施。需先确认 KIE/上游在缺省 aspect_ratio 时的行为（按首帧自适应还是报错），盲目放开会导致生成失败。
- 验证方式（实施后）：选择「自适应」并用 9:16 首帧提交，出片比例与首帧一致；用 16:9 首帧同理；普通固定比例选项行为不变。

## BUG-06：视频比例只有两种（P3，需上游确认）
- 状态：暂缓实施。需逐个核对 veo-3-1-premium / gemini-omni-flash-1-1 / gemini-omni / veo-3-1-lite 上游 API 文档支持的比例档位后再放开，不盲开。
- 验证方式（实施后）：每个模型的比例下拉与上游文档一致；用新开的比例各生成一次成功出片；原有比例行为不变。

## BUG-05：参考图只允许一张（P3）
- 状态：暂缓实施。涉及 video.tsx 状态改数组、多槽位上传 UI、按模型 imageInputMultiple 配置的提交逻辑，改动面大，建议单独立项并在有回归环境时实施。
- 验证方式（实施后）：配置多图的模型可传多张参考图并成功提交（image_input 为数组）；单图模型上限仍为 1 张；上传/删除单张不互相影响。

## BUG-25：首屏 TTFB / HTML 体积（P3，需回归环境）
- 状态：暂缓实施。messages 裁剪与 force-dynamic → ISR 都可能引起运行时缺 key 或用户态缓存问题，必须在可完整回归的环境下做，并逐页验证。
- 验证方式（实施后）：首页 HTML < 150KB、TTFB < 1s（正常网络）；全站主要页面（首页/create/pricing/settings/blog）无缺翻译报错；登录态与游客态分别验证。

## BUG-01 / BUG-02 / BUG-04：早期问题（需人工复现）
- 状态：保持核验结论不变。BUG-1（生图三入口可达性）与 BUG-2（按钮灰色出现条件，image.tsx:1608 与 isCheckSign）需按清单人工复现；BUG-4 需向朋友要复现步骤。
- 验证方式（复现时）：按清单记录的操作路径逐条复现，能复现的转正式修复并补验证方式；复现不出的注明环境与操作后关闭。

## BUG-25：首屏 TTFB / HTML 体积（P3）
- 改法：
  1. src/app/[locale]/layout.tsx:28 的 NextIntlClientProvider 按页面需要传 messages 子集（先做 landing 命名空间裁剪，预期 HTML 从 543KB 降至 100KB 内）；
  2. (landing)/page.tsx:7-8 的 force-dynamic 评估改 ISR（revalidate 60s），showcases/用户态改客户端拉取。
- 验收：首页 HTML < 150KB，TTFB < 1s（正常网络）。

## BUG-01 / BUG-02 / BUG-04：早期问题（细节缺失，先核验）
- 计划：这三条原文无细节（1/2 有视频证据但内容未描述）。先按清单定位的代码人工复现：生图三入口可达性（BUG-1）、按钮灰色出现条件（BUG-2，image.tsx:1608 与 isCheckSign 状态）；BUG-4 需向朋友要复现步骤。复现不出来就标记关闭，避免无的放矢。
- 验收：能复现则转正式修复，不能复现则注明关闭原因。
