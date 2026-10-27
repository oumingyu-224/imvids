import { defineConfig } from 'drizzle-kit';

import { envConfigs } from '@/config';

// get db credentials
const dbCredentials: { url: string; authToken?: string } = {
  url: envConfigs.database_url ?? '',
};
if (envConfigs.database_auth_token) {
  dbCredentials.authToken = envConfigs.database_auth_token;
}

// define config
export default defineConfig({
  out: envConfigs.db_migrations_out,
  schema: envConfigs.db_schema_file,
  dialect: envConfigs.database_provider as
    | 'sqlite'
    | 'postgresql'
    | 'mysql'
    | 'turso'
    | 'singlestore'
    | 'gel',
  dbCredentials,
  // 只管理业务 schema，避免 push/migrate 扫描 Supabase 平台系统 schema
  // （auth.* / storage.* / realtime.* 自带 CHECK 约束，会触发 drizzle-kit 解析崩溃）
  schemaFilter:
    envConfigs.database_provider === 'postgresql'
      ? ['public', envConfigs.db_schema].filter(
          (s, i, arr) => s && s.trim() && arr.indexOf(s) === i,
        )
      : undefined,
  // Migration journal location (used by drizzle-kit migrate)
  migrations:
    envConfigs.database_provider === 'postgresql'
      ? {
          schema: envConfigs.db_migrations_schema,
          table: envConfigs.db_migrations_table,
        }
      : undefined,
});
