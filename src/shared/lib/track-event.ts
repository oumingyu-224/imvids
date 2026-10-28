'use client';

/**
 * 业务事件埋点封装（AARRR 模型）
 * 同时上报到 Plausible（自定义事件 + 属性）和 Clarity（自定义事件 + 属性）。
 * 仅当对应统计脚本已注入（后台配置了 plausible / clarity）时才会实际发送，
 * 未配置时调用为空操作，不影响业务流程。
 */

type TrackProps = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(name: string, props?: TrackProps) {
  if (typeof window === 'undefined') {
    return;
  }

  const windowObject = window as any;

  // Plausible: 自定义事件 + 自定义属性
  if (typeof windowObject.plausible === 'function') {
    windowObject.plausible(name, props ? { props } : undefined);
  }

  // Clarity: 自定义事件 + 属性逐个 set
  if (typeof windowObject.clarity === 'function') {
    windowObject.clarity('event', name);
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined && value !== null) {
          windowObject.clarity('set', key, String(value));
        }
      }
    }
  }
}
