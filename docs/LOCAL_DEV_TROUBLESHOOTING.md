# Local Dev Troubleshooting

本文档整理本项目本地开发时遇到的几个高频问题，包括：

- 本地打开浏览器后反复报 `tailwindcss` 找不到
- 本地启动时报数据库连接错误
- `nvm install 24.x` / `nvm install 22.x` 一直失败
- `next dev` 提示 `.next/dev/lock` 被占用

## 1. Tailwind 本地报错，但线上正常

### 现象

- 本地 `pnpm dev` 后，浏览器打开页面反复报找不到 `tailwindcss`
- 进程反复重编译，直到卡死
- 线上构建、线上访问正常

### 根因

本地和线上使用的不是同一条运行链路：

- 本地开发：`next dev`
- 线上部署：`next build` + `next start`

这个项目使用：

- `Next.js 16.0.7`
- `Tailwind CSS 4`
- `@tailwindcss/postcss`

在本地开发模式下，`Turbopack` 更容易触发依赖解析和重编译异常；线上构建正常，不代表本地 dev 链路也正常。

### 当前建议

默认使用 `webpack` 跑本地 dev，不要优先用 `turbopack`。

`package.json` 里当前可用脚本：

```json
"dev": "next dev --webpack",
"dev:turbo": "next dev --turbopack",
"dev:webpack": "next dev --webpack"
```

### 启动命令

```bash
rm -rf .next
pnpm dev
```

如果要单独验证是不是 `Turbopack` 导致的问题：

```bash
pnpm dev:turbo
```

## 2. `nvm install 24.x` / `22.x` 一直失败

### 现象

```bash
nvm install 24.14.1
Version '24.14.1' not found
```

或者：

```bash
nvm ls-remote --lts
N/A
```

### 根因

不是版本号写错，而是 `nvm` 根本没拿到远端版本列表。

只要这条命令输出还是 `N/A`：

```bash
nvm ls-remote --lts
```

那么任何：

```bash
nvm install 24.x
nvm install 22.x
```

都会失败。

### 已确认的问题

终端最初无法解析外网域名：

```bash
curl -I https://nodejs.org/dist/index.tab
curl: (6) Could not resolve host: nodejs.org
```

### 解决方法

让终端走本地代理，当前可用端口是 `7897`：

```bash
export http_proxy=http://127.0.0.1:7897
export https_proxy=http://127.0.0.1:7897
export HTTP_PROXY=http://127.0.0.1:7897
export HTTPS_PROXY=http://127.0.0.1:7897
```

验证：

```bash
curl -I https://nodejs.org/dist/index.tab
nvm ls-remote --lts | tail -10
```

当 `nvm ls-remote --lts` 不再是 `N/A` 之后，再执行安装：

```bash
nvm install 24.13.1
nvm use 24.13.1
nvm alias default 24.13.1
node -v
```

### Node 版本建议

本项目不要用 `Node v25` 跑本地开发。

建议使用：

- `24.x` LTS
- 或 `22.x` LTS

项目里已增加：

```txt
.nvmrc
```

内容：

```txt
22
```

以及 `package.json` 的版本约束：

```json
"engines": {
  "node": ">=20.9 <25"
}
```

## 3. 数据库报错 `ENOTFOUND aws-1-ap-southeast-1.pooler.supabase.com`

### 现象

本地启动后页面报错：

```txt
Error: Failed query: select "name", "value" from "chatgptimage2"."config"
...
getaddrinfo ENOTFOUND aws-1-ap-southeast-1.pooler.supabase.com
```

### 根因

不是 SQL 本身有问题，而是数据库域名解析失败。

报错点在：

- [src/shared/models/config.ts](/Users/admin/Desktop/0AI站/chatgptimage2/src/shared/models/config.ts:60)
- [src/core/db/postgres.ts](/Users/admin/Desktop/0AI站/chatgptimage2/src/core/db/postgres.ts:8)

真实根因是：

- `Node/Postgres` 连接数据库时走系统 resolver
- 本机原生 DNS 解析不了 Supabase 数据库域名
- 但 `curl` 走代理/DoH 可以解析

### 已确认的情况

以下两个域名通过 DoH 可解析：

- `db.tiitqtybcrofpndtsdgh.supabase.co`
- `aws-1-ap-southeast-1.pooler.supabase.com`

但以下命令最初会失败：

```bash
node -e "require('dns').lookup('aws-1-ap-southeast-1.pooler.supabase.com', console.log)"
node -e "require('dns').lookup('db.tiitqtybcrofpndtsdgh.supabase.co', console.log)"
```

### 连接方式建议

本地开发优先使用 `Session pooler:5432`，不要优先用 direct host。

推荐：

```env
DATABASE_URL="postgresql://postgres.tiitqtybcrofpndtsdgh:你的真实密码@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

不建议本地优先使用：

```env
postgresql://postgres:[YOUR-PASSWORD]@db.tiitqtybcrofpndtsdgh.supabase.co:5432/postgres
```

原因：

- direct host 当前解析到的是 `AAAA`
- 本地网络更容易在 IPv6 上踩坑

### 临时解决方案

如果系统 resolver 仍然解析不到 pooler host，可以临时写 `/etc/hosts`。

已通过 DoH 查到的 A 记录：

- `13.213.241.248`
- `54.179.210.0`

临时加入 `/etc/hosts`：

```txt
13.213.241.248 aws-1-ap-southeast-1.pooler.supabase.com
54.179.210.0 aws-1-ap-southeast-1.pooler.supabase.com
```

然后刷新 DNS 缓存：

```bash
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

验证：

```bash
node -e "require('dns').lookup('aws-1-ap-southeast-1.pooler.supabase.com', console.log)"
```

当前已验证可返回：

```txt
null 13.213.241.248 4
```

### 注意

这个 `/etc/hosts` 方法只是临时兜底。

原因：

- `pooler` 背后是 AWS ELB
- IP 可能变化
- 长期应修复 Clash Verge / 系统 DNS 接管问题，而不是长期依赖静态 hosts

## 4. `.env.local` 和 `.env.development` 混用

### 现象

Next dev 启动日志显示：

```txt
Environments: .env.local, .env.development
```

如果两个文件里都定义数据库配置，就可能出现：

- `DATABASE_URL` 来自一套
- `DB_SCHEMA` 来自另一套

最终导致本地配置“拼接生效”。

### 当前建议

数据库相关配置统一放到 `.env.local`。

本地推荐保留：

```env
DATABASE_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres.tiitqtybcrofpndtsdgh:你的真实密码@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"
DB_SCHEMA="chatgptimage2"
DB_MIGRATIONS_SCHEMA="chatgptimage2"
DB_MIGRATIONS_TABLE="__drizzle_migrations"
DB_SCHEMA_FILE="./src/config/db/schema.postgres.ts"
DB_MIGRATIONS_OUT="./src/config/db/migrations_chatgptimage2"
DB_SINGLETON_ENABLED="true"
DB_MAX_CONNECTIONS="1"
```

然后把 `.env.development` 里的重复数据库项删掉或注释掉，避免混配。

## 5. `Unable to acquire lock at .next/dev/lock`

### 现象

```txt
Unable to acquire lock at .../.next/dev/lock, is another instance of next dev running?
```

同时可能看到：

```txt
Port 3000 is in use by process 70787
```

### 根因

之前的 `next dev` 进程还活着，或者异常退出后锁文件残留。

### 解决命令

先查占用进程：

```bash
ps -p 70787 -o pid,ppid,command
```

结束进程：

```bash
kill 70787
```

如果还不退出：

```bash
kill -9 70787
```

删除残留锁：

```bash
rm -f .next/dev/lock
```

重新启动：

```bash
pnpm dev
```

如果要先查所有本项目的 Next dev 进程：

```bash
ps aux | grep 'next dev' | grep -v grep
```

## 6. 推荐的本地启动顺序

### 第一次启动或环境异常后

```bash
export http_proxy=http://127.0.0.1:7897
export https_proxy=http://127.0.0.1:7897
export HTTP_PROXY=http://127.0.0.1:7897
export HTTPS_PROXY=http://127.0.0.1:7897
```

如果 Node 版本不对：

```bash
nvm use 24.13.1
node -v
```

如果数据库 DNS 已通过 `/etc/hosts` 兜底：

```bash
node -e "require('dns').lookup('aws-1-ap-southeast-1.pooler.supabase.com', console.log)"
```

清缓存并启动：

```bash
rm -rf .next
pnpm install
pnpm dev
```

## 7. 快速自检命令

### 检查 Node 版本

```bash
node -v
```

### 检查 `nvm` 远端列表是否正常

```bash
nvm ls-remote --lts | tail -10
```

### 检查终端是否能走代理

```bash
curl -I https://nodejs.org/dist/index.tab
echo $http_proxy
```

### 检查数据库 host 是否能被 Node 解析

```bash
node -e "require('dns').lookup('aws-1-ap-southeast-1.pooler.supabase.com', console.log)"
```

### 检查 Next dev 残留进程

```bash
ps aux | grep 'next dev' | grep -v grep
```

## 8. 当前结论

这次本地问题最终不是单点故障，而是多个问题叠加：

- `Node v25` 不适合作为本地开发运行时
- 本地 dev 应优先使用 `webpack` 而非 `turbopack`
- `nvm install` 失败根因是终端最初无法正常访问外网下载源
- 数据库查询失败根因是系统 resolver 无法解析 Supabase 数据库域名
- `.env.local` 与 `.env.development` 混用导致数据库配置更容易混乱
- `.next/dev/lock` 报错是旧的 Next dev 进程未退出

按本文档逐项处理后，可以把问题拆开定位，不要把所有报错混在一起看。
