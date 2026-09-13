# seevideo.ai 中文首页代码提取

- 抓取时间：2026-09-13
- 来源：https://seevideo.ai/zh
- 站点类型：Next.js（Turbopack 构建，静态资源在 `/_next/static/immutable/`）

## 文件说明

- `index.html`：首页完整 HTML（含服务端渲染的 DOM 结构和内联数据）。
- `assets.txt`：从 index.html 提取到的 CSS/JS 资源路径列表（39 项）。
- `*.css`：3 个样式文件
  - `1mbj8avhbryj-.css`（约 274KB）：主样式（Tailwind 产物）
  - `1boqiryzydgvg.css`、`1vffuymp_k1n_.css`：附加样式
- `*.js`：36 个 JS chunk（打包压缩产物，非源码；含页面交互与数据逻辑）。

## 备注

- JS 均为构建后压缩代码，只能做参考/对照，不可直接还原成源码。
- 与本目录早前的 `seevideo-pricing.html`、`sv-*.html`（价格页抓取）互补；本次是 zh 首页。
- 页面价格区块 DOM 文本可参考早前整理的 `seevideo-plans-by-dom.md`、`模型价格.md`。
