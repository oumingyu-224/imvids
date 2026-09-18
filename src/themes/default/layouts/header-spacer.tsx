'use client';

import { useEffect, useState } from 'react';

/**
 * 文档流占位：实测 fixed 头部的真实渲染高度（含促销条），
 * 头部多高，占位就多高，促销条显示/关闭自动跟随。
 */
export function HeaderSpacer() {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const update = () => setHeight(header.offsetHeight);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  return <div style={{ height }} aria-hidden="true" />;
}
