• Supabase + Drizzle 建表 SOP

  适用场景：你这个项目要按 ShipAny 的教程，把表建到 Supabase 的 chatgptimage2 schema 里。
  核心原则：先关代理、只用 production env、先 generate 再 migrate、旧 migration 不混用。

  1. 前置检查

  2. 关闭代理、VPN、网络加速器。
  3. 如果之前把数据库密码贴出来过，先去 Supabase 旋转密码。
  4. 进入 Supabase 项目顶部 Connect -> ORMs -> Drizzle，复制整条 DATABASE_URL。
  5. 不要手改 host，不要自己拼 URL。

  6. 配置 .env.production
  编辑 .env.production:12，确保至少这几项是这样：

  DATABASE_PROVIDER="postgresql"
  DATABASE_URL="从 Supabase Connect -> ORMs -> Drizzle 复制的整条 URL"

  DB_SCHEMA_FILE="./src/config/db/schema.postgres.ts"
  DB_MIGRATIONS_OUT="./src/config/db/migrations_chatgptimage2"
  DB_SINGLETON_ENABLED="true"
  DB_MAX_CONNECTIONS="1"

  DB_SCHEMA="chatgptimage2"
  DB_MIGRATIONS_SCHEMA="chatgptimage2"
  DB_MIGRATIONS_TABLE="__drizzle_migrations"

  说明：

  - DB_MIGRATIONS_OUT 必须用一个新的目录，不要再用旧的 src/config/db/migrations
  - 这样可以避免把旧的 public migration 和新的 schema migration 混在一起

  3. 清理新 migration 目录
  每次准备重新按教程跑时，先执行：

  rm -rf src/config/db/migrations_chatgptimage2

  这一步只删新的 migration 目录，不动旧目录。

  4. 生成 migration
  不要再用容易打错的环境变量前缀。直接用显式命令：

  pnpm exec tsx scripts/with-env.ts --env=.env.production npx drizzle-kit generate --config=src/core/db/config.ts

  成功后，检查新目录里是否生成了文件，例如：

  src/config/db/migrations_chatgptimage2/0000_xxx.sql
  src/config/db/migrations_chatgptimage2/meta/_journal.json

  再打开生成的 SQL，确认里面是这种格式：

  CREATE TABLE "chatgptimage2"."account" ...
  CREATE TABLE "chatgptimage2"."ai_task" ...

  如果是 "account" 而不是 "chatgptimage2"."account"，说明配置不对，不要继续 migrate。

  5. 执行 migration
  确认第 4 步没问题后，再执行：

  pnpm exec tsx scripts/with-env.ts --env=.env.production npx drizzle-kit migrate --config=src/core/db/config.ts

  6. 到 Supabase 检查结果

  7. 打开 Supabase 左侧 Table Editor
  8. 切换 schema 为 chatgptimage2
  9. 看是否出现：
      - account
      - ai_task
      - user
      - order
      - post
      - 其他业务表

  10. 常见报错对照

  - ENOTFOUND ...supabase.com
      - 原因：代理/VPN/DNS/当前网络问题
      - 处理：先关代理，再试；不行就换手机热点
  - Loading environment from: .env.development
      - 原因：命令没指定 env，或者把 ENV_FILE 打错了
      - 处理：只用我上面那两条显式 --env=.env.production 命令
  - Can't find meta/_journal.json file
      - 原因：你直接 migrate 了，但还没 generate
      - 处理：先 generate，再 migrate
  - relation "account" already exists
      - 原因：你跑到了旧的 public migration
      - 处理：确认 DB_MIGRATIONS_OUT 是 migrations_chatgptimage2，删掉该目录后重新 generate
  - schema "chatgptimage2" already exists, skipping
      - 原因：这是正常提示，不是错误
      - 处理：忽略它，看后续是否继续建表

  8. 最稳的执行顺序
  以后每次都按这个顺序：

  rm -rf src/config/db/migrations_chatgptimage2
  pnpm exec tsx scripts/with-env.ts --env=.env.production npx drizzle-kit generate --config=src/core/db/config.ts
  pnpm exec tsx scripts/with-env.ts --env=.env.production npx drizzle-kit migrate --config=src/core/db/config.ts

  9. 兜底方案
  如果你只想把表建出来，不想再受本地网络影响：

  10. 用第 4 步生成 SQL
  11. 去 Supabase SQL Editor
  12. 执行生成出来的 SQL 文件内容

  这份 SOP 对你这个项目是够用的。
  如果你要，我可以下一条把它整理成一份 DATABASE-SOP.md 直接放进项目里。