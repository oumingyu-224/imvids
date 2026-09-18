'use client';

import { useEffect, useState } from 'react';

/**
 * 文档流占位：只补偿促销条的高度。
 * 促销条显示 → 占位 = 促销条实测高度；促销条关闭或不存在 → 占位为 0。
 */
export function HeaderSpacer() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;

    const update = () => {
      // 促销条是 header 内唯一的 h-10 直接子元素，关闭后从 DOM 移除
      const promo = header.querySelector<HTMLElement>(':scope > .h-10');
      setHeight(promo ? promo.offsetHeight : 0);
    };

    update();
    // 促销条增删会改变 header 高度，借此触发重新测量
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  if (height === 0) return null;
  return <div style={{ height }} aria-hidden="true" />;
}
