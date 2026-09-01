'use client';

import { ReactNode, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

import { envConfigs } from '@/config';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();

  useEffect(() => {
    if (typeof document !== 'undefined' && locale) {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={envConfigs.appearance}
      // 强制暗色模式：即使 localStorage 中存有 light/system 也只渲染暗色
      // 恢复主题切换时，删除 forcedTheme 并取消下面 enableSystem 的注释即可
      forcedTheme="dark"
      // enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
