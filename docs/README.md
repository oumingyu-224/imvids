# docs 目录说明

本目录收纳根目录的历史文档与工作过程文档，均只做记录和分析，不参与项目运行。根目录仅保留 CLAUDE.md（AI 编码指引）和 README.md（站点地图）。

## 项目说明 / 开发指引

| 文件 | 作用 |
|---|---|
| `README.old.md` | 模板原作者说明：Nano Banana Pro 项目预览地址、快速上手手册、预制数据与视频教程链接。 |
| `workflow.md` | 「先 Research 后 Plan 再实现」的 AI 编程工作流整理，是本目录各 research/plan 文档的方法论来源。 |
| `sql.md` | Supabase + Drizzle 建表 SOP：`chatgptimage2` schema 的迁移生成/执行步骤（关代理、新 migration 目录、显式命令）。 |
| `LOCAL_DEV_TROUBLESHOOTING.md` | 本地开发故障手册：Tailwind 报错（建议 webpack）、数据库连接、nvm 安装失败、`.next/dev/lock` 占用的根因与解法。 |
| `流程.md` | 一次 AI 编程会话的对话记录（git 强推卡住问题的处理过程），仅作过程留档。 |

## 模板远程更新对比链（按阅读顺序）

| 文件 | 作用 |
|---|---|
| `2026-remote-updates.md` | 模板远程仓库 `origin/main` 2026 年 20 条提交记录，按模块汇总。 |
| `2026-remote-updates-vs-chatgptimage2-compare.md` | 远程更新与 `../chatgptimage2` 项目逐文件对比报告（相同/不同/缺失统计与建议）。 |
| `chatgptimage2-diff-analysis.md` | 分析 `chatgptimage2-diff-files/` 与本项目的差异：不建议整体覆盖，按模块选择性吸收。 |
| `chatgptimage2-diff-analysis-missing-2026.md` | 补上一份的遗漏：完整 2026 提交时间线 + 158 个未覆盖文件路径清单。 |
| `chatgptimage2-diff-files-missing-2026-compare.md` | 158 个缺失路径的实际对比结果：112 内容不同、37 项目缺失、7 diff-files 缺失、2 两边都缺。 |

## 对比链的 research / plan 产物（按 workflow.md 流程产出）

| 文件 | 作用 |
|---|---|
| `diff-update-research.md` | 整合三份 diff 报告的研究文档，作为最终更新报告的依据（research 阶段产物）。 |
| `diff-update-report-plan.md` | 基于 research 的实施计划：九条原则（不整体覆盖、分模块提交、`diffanalysis` 分支验证）+ 各模块意图与风险。 |
| `auth-expected-results.md` | Auth 修改的人工验证清单：登录/注册页配置泄露修复的预期效果与验证方法。 |

## 模型调研

| 文件 | 作用 |
|---|---|
| `chatgptimage2-features-summary.md` | ChatGPT Image 2 / `gpt-image-2` 模型特性调研（官方命名口径、输入输出能力），接入 OpenAI API 前的资料整理。 |
