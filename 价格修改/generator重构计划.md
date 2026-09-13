# Generator 组件重构计划（对齐 seevideo 工作台）

## 参照文件
- `价格修改/01-图片工作台页面.md` — 图片工作台（文本转图片）完整 DOM
- `价格修改/02-图片模型选择弹层.md` — 图片模型 Popover
- `价格修改/03-视频工作台页面.md` — 视频工作台（文本转视频）完整 DOM
- `价格修改/04-视频模型选择弹层.md` — 视频模型 Popover
- `价格修改/图片转.md` — 图片转视频 + 图片转图片 两块 DOM

## 现状
- `generator/image.tsx`：左栏为 PromptShowcase panel 模式，右栏为 featured 轮播 + "Ready to generate" 摘要，布局类是项目自有样式，与 seevideo 不一致。
- seevideo 结构 = 两大工作台（图片/视频同布局、表单项不同）+ 两个模型选择 Popover（搜索 + 卡片列表）。
- 首页 if/else 切换、动画交接已实现，保持不动。

---

## 一、布局骨架对齐 01/03（generator/image.tsx）

- [ ] 外层容器：`flex min-w-0 flex-1 flex-col overflow-hidden`
- [ ] main：`custom-scrollbar-thin flex flex-col overflow-y-auto overflow-x-hidden bg-background p-2 pb-20 md:pb-2 lg:overflow-hidden`，高度 `calc(100dvh - 4rem)`
- [ ] 顶部标题行：
  - [ ] h1：`生成` + 渐变高亮词（`bg-gradient-to-r from-[hsl(var(--highlight))] to-[hsl(46,55%,80%)] bg-clip-text italic`）+ `秒内`
  - [ ] 「AI 工作空间」徽章：`rounded-full border border-[hsl(var(--highlight))]/30 bg-[hsl(var(--highlight))]/10` + Sparkles 图标
  - [ ] 副标题：`mt-1 text-xs text-foreground/40`
- [ ] 左右分栏容器：`flex flex-1 flex-col gap-4 md:gap-6 lg:flex-row lg:overflow-hidden`
- [ ] 移除现有 `landing-divider-soft` 等项目自有布局类

## 二、左栏表单重做（`lg:w-[380px] xl:w-[420px]` 固定宽卡片）

### 卡片容器
- [ ] `rounded-xl border border-border/50 bg-form-background shadow-lg flex h-full flex-col`

### 顶部区（p-6 pb-2）
- [ ] 视频/图片切换胶囊：`grid grid-cols-2 rounded-full border border-white/[0.06] bg-black/40 p-0.5`，选中项 `bg-white/[0.12]` 白字，未选中 `text-gray-500`
- [ ] 模型选择按钮：`h-9 border-border/50 bg-card` 圆角按钮，模型图标 `h-6 w-6` + 名称 `text-highlight truncate` + chevron-down，点击打开 Popover

### tab 区
- [ ] 文本转图片 / 图片转图片（视频模式：文本转视频 / 图片转视频），四个状态均为独立工作台形态
- [ ] `relative flex w-full border-b border-border/40`，选中 tab `text-foreground` + 底部 `h-[2px] bg-[hsl(var(--highlight))]` 高亮条，未选中 `text-muted-foreground`

### 上传区（图片转视频 / 图片转图片专属，位于提示词上方）

图片转视频（单图 + 结尾帧）：
- [ ] label「上传图片」+ 右侧「添加结尾帧」开关（`bg-muted/40` 默认关，开启进入首尾帧模式）
- [ ] 单图上传卡：`media-card-surface group rounded-xl border-2 border-dashed`，内部 `flex flex-col items-center gap-4 p-8`
- [ ] cloud-upload 图标：`h-16 w-16 rounded-full bg-[hsl(var(--highlight))]/10`，图标 `h-8 w-8 text-[hsl(var(--highlight))]`
- [ ] 文案：「拖放图片或点击选择图片」/「JPG/PNG（最大 10MB）」/「或从以下选择 `素材库`」
- [ ] 素材库按钮：`gradient-glow-text font-semibold underline decoration-[hsl(var(--highlight))]/30 underline-offset-2 hover:scale-110`
- [ ] hidden file input：accept `image/jpeg,image/png,image/webp`

图片转图片（多图参考）：
- [ ] hidden file input：`multiple`，同 accept
- [ ] 参考图网格：`grid grid-cols-3 gap-4`，默认 6 张方形卡（`aspect-square min-height:100px`，`flex flex-col items-center justify-center gap-2 p-1`）
- [ ] 卡内：`h-10 w-10` 上传图标圆 + 「上传图片」/「或从以下选择 素材库」/ 第三行小字（首卡空白、其余「（可选）」）
- [ ] 首卡必填、其余可选
- [ ] 底部展开按钮：`interactive-surface rounded-lg border px-4 py-2`，文案「显示全部（14）」+ chevron-down——参考图最多 14 张，折叠显示 6 张

### 提示词区
- [ ] textarea：`min-h-[100px] md:min-h-[140px] border-border/50 bg-card pb-9 pr-10 caret-foreground`
- [ ] maxlength 按模式：文生图 2995、图生图 2996（placeholder「描述您想要如何编辑图像...」）、视频 2000
- [ ] 左下角小按钮按模式：图片模式=图片反推提示词 + AI 生成提示词；视频模式=仅 AI 生成提示词
- [ ] 右下字符计数：`text-muted-foreground` 如 `0/2995`

### 配置项
- [ ] 宽高比：可展开选择卡，`min-h-[64px] rounded-xl bg-card/45 px-4 py-3`，左侧比例预览框（`rounded border-2 border-muted-foreground`，尺寸按比例）+ 值 + `chevron-right rotate-90`，选中 `hover:bg-card/60 border-border/10`
- [ ] 质量（图片模式）：`grid grid-cols-3` 基础/高清/超清，选中项 `gradient-border + border-image linear-gradient + gradient-text`，未选中 `border-muted text-muted-foreground hover:border-primary`
- [ ] 图片数量（图片模式）：`grid grid-cols-4` 1/2/3/4，选中样式同上
- [ ] 视频时长（视频模式）：滑块，轨道 `h-2 rounded-full bg-background/55`，填充 `bg-[hsl(var(--highlight))]/45`，圆点 `h-4 w-4 bg-[hsl(var(--highlight))]` + 内白点，右侧显示秒数
- [ ] 分辨率（视频模式）：`grid grid-cols-3` 480p/720p/1080p，样式同质量
- [ ] 生成音频（视频模式）：开关，默认 `bg-muted/60`，开启 `bg-gradient-to-r from-[hsl(var(--gradient-start))] to-[hsl(var(--gradient-end))]`
- [ ] 公开可见性：gem 图标 + gradient 开关（两种模式都有）
- [ ] 各 label 带 `lucide-info` 提示图标 `cursor-help text-muted-foreground`

### 底部固定区（`flex-shrink-0 border-t border-border pt-4`）
- [ ] 所需积分卡：`rounded-lg border border-[hsl(var(--highlight))]/10 bg-[hsl(var(--highlight-light))]/10`，coins 图标 + 数值 `text-[hsl(var(--highlight))]`（图片 40 / 视频 25，可按配置计算）
- [ ] 生成按钮：全宽 `gradient-button`，`bg-primary h-9 font-semibold text-primary-foreground`，未登录/积分不足态显示锁图标 + "Upgrade to Generate"

## 三、模型选择 Popover 组件（新建，对应 02/04）

- [ ] 新建 `src/shared/blocks/generator/model-select.tsx`（或同级目录）
- [ ] Radix Popover / shadcn Popover：`w-[363px] rounded-md border-border/50 bg-[#111] shadow-2xl`
- [ ] 搜索框：search 图标 + `placeholder="搜索模型..."` 透明输入框，底部 `border-border/30`
- [ ] 列表：`max-h-[60vh] flex-col overflow-auto`
- [ ] 模型卡片结构：
  - [ ] 图标（`/model_icon/xxx.svg`，项目内需放对应模型图标）+ 名称 `text-lg font-medium` + 徽章（新/最优/专业版/MAX/至尊版/热门/音频/MULTI，`rounded-full px-2 py-1 text-xs bg-highlight-hover/20 text-highlight-hover border-highlight-hover/30`）
  - [ ] 描述：`text-sm text-muted-foreground`
  - [ ] 能力 chips：`rounded-xl border border-border/50 bg-card px-2 py-1 text-xs`（时长如 4-10s、积分/s 如 40+、HD、多图、尾帧、文本和图片等）
  - [ ] 选中态：`border-l-2 border-l-highlight bg-[#1a1a1a]`，名称 `text-highlight`，右侧 check 图标
  - [ ] 锁定态：`grayscale` + 黑色遮罩（`bg-black/60 backdrop-blur-sm`）+ lock 图标 + 「高级功能」「点击升级」
  - [ ] 推荐标：右下 `bg-highlight/10 text-highlight`「⭐ 推荐」
- [ ] 模型数据抽成 JSON 配置 `models.ts`（或 `models.json`）：图片组 11 个、视频组 23 个，卡片全部由循环渲染，不硬编码
- [ ] JSON 字段结构：
  - `id` / `name` / `icon`（模型图标路径）/ `badges`（新、最优、专业版、MAX、至尊版、热门、音频、MULTI 等徽章数组）
  - `description`（卡片描述）
  - `capabilities`（能力 chips 数组：时长、积分/s、HD、多图、尾帧、文本和图片等）
  - `locked`（是否锁定）/ `lockedTier`（解锁所需套餐名）
  - `recommended`（⭐ 推荐标）
  - `pricing`：所需积分、与定价页关联的套餐等级、定价页锚点/链接
- [ ] Popover 组件纯循环渲染 JSON，搜索框按 name 过滤
- [ ] 定价页打通：`lockedTier` 与定价页套餐一一对应，锁定卡片点击「点击升级」→ 跳转定价页并定位到对应套餐（锚点/hash）
- [ ] 所需积分显示取自 JSON `pricing`，与定价页该模型套餐积分口径一致
- [ ] 定价页套餐结构如有变更，只改 JSON/定价数据源，Popover 组件不动

## 四、右栏预览区

- [ ] 卡片容器：`rounded-xl border border-border/30 bg-form-background backdrop-blur-md shadow flex-1 flex-col`
- [ ] 标题：images/film 图标 `text-primary` + `gradient-text`「我的图片 / 我的视频」
- [ ] 预览区：`p-6 pt-0 flex-1 overflow-hidden`，中间 `object-contain` 大图占位（图片用现有 featured 素材，视频可用 poster 占位）
- [ ] 保留「Ready to generate」配置摘要区（现有实现），样式适配新容器

## 五、模式切换与数据

- [ ] mode（图片/视频）× tab（文本转/图片转）共四种工作台形态，共用同一布局骨架：
  - 文本转图片：提示词 + 宽高比 + 质量 + 数量 + 公开可见性，积分 40
  - 图片转图片：参考图网格（6/14）+ 提示词（2996）+ 宽高比 + 质量 + 数量 + 公开可见性，积分 40
  - 文本转视频：提示词（2000）+ 宽高比 + 时长滑块 + 分辨率 + 生成音频 + 公开可见性，积分 25
  - 图片转视频：单图上传 + 结尾帧开关 + 提示词（2000）+ 时长滑块 + 分辨率 + 生成音频 + 公开可见性，积分 25
- [ ] 表单项集合、模型列表、tab 文案、右栏标题与预览类型随 mode/tab 切换
- [ ] initialConfig 交接：首页带来的 prompt/ratio 继续作为初始值
- [ ] 所需积分根据模式 + 模型 + 配置计算（先按 md 静态值：图片 40、视频 25）

## 六、保持不变 / 不做

- 首页 if/else 切换逻辑（landing-generator-toggle.tsx）
- framer-motion 页面过渡与内容飞入动画
- 不接后端生成 API，不做登录/积分校验逻辑（仅展示样式态）
- 不动导航、其他页面

## 涉及文件

| 文件 | 操作 |
| --- | --- |
| `src/shared/blocks/generator/image.tsx` | 重写布局与表单 |
| `src/shared/blocks/generator/model-select.tsx` | 新建（模型 Popover） |
| `src/shared/blocks/generator/models.ts` | 新建（模型配置数据） |
| `public/model_icon/*.svg` | 新增模型图标资源 |
| `src/shared/blocks/common/prompt-showcase.tsx` | 仅保留交接逻辑，样式职责移入 generator |
