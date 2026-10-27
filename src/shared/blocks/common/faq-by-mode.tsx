'use client';

import { useEffect, useState } from 'react';

import { FAQ } from '@/themes/default/blocks/faq';
import type { Section } from '@/shared/types/blocks/landing';

/**
 * BUG-12：随生成器模式（图片/视频）切换的 FAQ 区块。
 * 监听 ImageGenerator 广播的 generator:mode-change 事件切换内容。
 */
export function FaqByMode({
  imageSection,
  videoSection,
}: {
  imageSection: Section;
  videoSection: Section;
}) {
  const [mode, setMode] = useState<'image' | 'video'>('image');

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ mode?: string }>).detail;
      if (detail?.mode === 'image' || detail?.mode === 'video') {
        setMode(detail.mode);
      }
    };
    window.addEventListener('generator:mode-change', handler);
    return () => window.removeEventListener('generator:mode-change', handler);
  }, []);

  return <FAQ section={mode === 'video' ? videoSection : imageSection} />;
}
