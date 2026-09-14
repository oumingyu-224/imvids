'use client';

import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { cn } from '@/shared/lib/utils';

import { GRAD_PRO, GRAD_STARTER, GRAD_UNLIMITED } from './pricing-constants';

type CompareCell = { s?: string; sub?: string[]; p: string } | 'X';

// 列顺序：入门月、入门年、专业月、专业年、无限月、无限年、一次性199、一次性499
// 套餐属性行（位于模型行之前）
const COMPARE_META_ROWS: Array<{ labelKey: string; cells: Array<CompareCell> }> = [
  {
    labelKey: 'compare_row_price',
    cells: [
      { p: '$29.99', sub: ['compare_unit_monthly'] },
      { p: '$8.3', sub: ['compare_unit_monthly'] },
      { p: '$89.99', sub: ['compare_unit_monthly'] },
      { p: '$25', sub: ['compare_unit_monthly', 'compare_save_30'] },
      { p: '$149.99', sub: ['compare_unit_monthly'] },
      { p: '$75', sub: ['compare_unit_monthly', 'compare_save_50'] },
      { p: '$199.99', sub: ['compare_onetime'] },
      { p: '$499.99', sub: ['compare_onetime'] },
    ],
  },
  {
    labelKey: 'compare_row_credits',
    cells: [
      { p: '2,500', sub: ['compare_unit_monthly'] },
      { p: '10,000', sub: ['compare_unit_yearly'] },
      { p: '10,000', sub: ['compare_unit_monthly'] },
      { p: '32,000', sub: ['compare_unit_yearly'] },
      { p: 'compare_unlimited' },
      { p: 'compare_unlimited' },
      { p: '23,500' },
      { p: '60,000' },
    ],
  },
  {
    labelKey: 'compare_row_concurrency',
    cells: [
      { p: '1' },
      { p: '1' },
      { p: '3' },
      { p: '3' },
      { p: '5' },
      { p: '5' },
      { p: '3' },
      { p: '6' },
    ],
  },
  {
    labelKey: 'compare_row_watermark',
    cells: [
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
      { p: '✓' },
    ],
  },
  {
    labelKey: 'compare_row_license',
    cells: [
      'X',
      { p: '✓' },
      'X',
      { p: '✓' },
      'X',
      { p: '✓' },
      'X',
      'X',
    ],
  },
  {
    labelKey: 'compare_row_discount',
    cells: [
      { p: 'compare_disc_regular' },
      { p: 'compare_disc_90' },
      { p: 'compare_disc_regular' },
      { p: 'compare_disc_90' },
      { p: 'compare_disc_100' },
      { p: 'compare_disc_100' },
      { p: 'compare_disc_regular' },
      { p: 'compare_disc_regular' },
    ],
  },
];

const COMPARE_ROWS: Array<{ name: string; cells: Array<CompareCell> }> = [
  { name: 'Seedance 2.5', cells: [{ p: '160' }, { s: '160', p: '128' }, { p: '160' }, { s: '160', p: '112' }, { p: '160' }, { s: '160', p: '64' }, { p: '160' }, { p: '160' }] },
  { name: 'Seedance 2.0', cells: [{ p: '80' }, { s: '80', p: '64' }, { s: '80', p: '65' }, { s: '80', p: '56' }, { s: '80', p: '40' }, { s: '80', p: '32' }, { p: '80' }, { p: '80' }] },
  { name: 'Seedance 2.0 Fast', cells: [{ p: '65' }, { s: '65', p: '52' }, { s: '65', p: '50' }, { s: '65', p: '39' }, { s: '65', p: '35' }, { s: '65', p: '26' }, { p: '65' }, { p: '65' }] },
  { name: 'Seedance 2.0 Mini', cells: [{ p: '55' }, { s: '55', p: '44' }, { s: '55', p: '45' }, { s: '55', p: '33' }, { s: '55', p: '30' }, { s: '55', p: '22' }, { p: '55' }, { p: '55' }] },
  { name: 'Veo 3 Premium', cells: [{ p: '150' }, { s: '150', p: '120' }, { s: '150', p: '120' }, { s: '150', p: '105' }, { s: '150', p: '75' }, { s: '150', p: '60' }, { p: '150' }, { p: '150' }] },
  { name: 'Veo 3.1 Basic', cells: [{ p: '150' }, { s: '150', p: '120' }, { s: '150', p: '120' }, { s: '150', p: '105' }, { s: '150', p: '75' }, { s: '150', p: '60' }, { p: '150' }, { p: '150' }] },
  { name: 'Veo 3.1 Premium', cells: ['X', { s: '200', p: '160' }, { s: '200', p: '160' }, { s: '200', p: '140' }, { s: '200', p: '100' }, { s: '200', p: '80' }, 'X', { p: '200' }] },
  { name: 'Gemini Omni Flash 1.1', cells: [{ p: '55' }, { s: '55', p: '44' }, { s: '55', p: '44' }, { s: '55', p: '38' }, { s: '55', p: '27' }, { s: '55', p: '22' }, { p: '55' }, { p: '55' }] },
  { name: 'Gemini Omni', cells: [{ p: '55' }, { s: '55', p: '44' }, { s: '55', p: '44' }, { s: '55', p: '38' }, { s: '55', p: '27' }, { s: '55', p: '22' }, { p: '55' }, { p: '55' }] },
  { name: 'Wan 3.0', cells: [{ p: '40' }, { s: '40', p: '32' }, { s: '40', p: '32' }, { s: '40', p: '28' }, { s: '40', p: '20' }, { s: '40', p: '16' }, { p: '40' }, { p: '40' }] },
  { name: 'Wan 3.0 Prime', cells: [{ p: '50' }, { s: '50', p: '40' }, { s: '50', p: '40' }, { s: '50', p: '35' }, { s: '50', p: '25' }, { s: '50', p: '20' }, { p: '50' }, { p: '50' }] },
  { name: 'MiniMax H3', cells: [{ p: '100' }, { s: '100', p: '80' }, { s: '100', p: '80' }, { s: '100', p: '70' }, { s: '100', p: '50' }, { s: '100', p: '40' }, { p: '100' }, { p: '100' }] },
  { name: 'Kling 2.1 Master', cells: ['X', { s: '200', p: '160' }, 'X', { s: '200', p: '140' }, { s: '200', p: '100' }, { s: '200', p: '80' }, 'X', { p: '200' }] },
  { name: 'LTX 2.5 Fast', cells: [{ p: '40' }, { s: '40', p: '4' }, { p: '40' }, { s: '40', p: '4' }, { s: '40', p: '免费' }, { s: '40', p: '免费' }, { p: '40' }, { p: '40' }] },
  { name: 'Seedance 1.5 Pro', cells: [{ p: '40' }, { s: '40', p: '4' }, { p: '40' }, { s: '40', p: '4' }, { s: '40', p: '免费' }, { s: '40', p: '免费' }, { p: '40' }, { p: '40' }] },
  { name: 'Veo 3.1 Lite', cells: [{ p: '75' }, { s: '75', p: '7' }, { p: '75' }, { s: '75', p: '7' }, { s: '75', p: '免费' }, { s: '75', p: '免费' }, { p: '75' }, { p: '75' }] },
  { name: 'Wan 2.5', cells: [{ p: '100' }, { s: '100', p: '10' }, { p: '100' }, { s: '100', p: '10' }, { s: '100', p: '免费' }, { s: '100', p: '免费' }, { p: '100' }, { p: '100' }] },
  { name: 'PixVerse V6', cells: [{ p: '70' }, { s: '70', p: '7' }, { p: '70' }, { s: '70', p: '7' }, { s: '70', p: '免费' }, { s: '70', p: '免费' }, { p: '70' }, { p: '70' }] },
  { name: 'Seedream 5.0 Lite', cells: [{ p: '40' }, { s: '40', p: '4' }, { p: '40' }, { s: '40', p: '4' }, { s: '40', p: '免费' }, { s: '40', p: '免费' }, { p: '40' }, { p: '40' }] },
  { name: 'Seedream 4.0', cells: [{ p: '30' }, { s: '30', p: '3' }, { p: '30' }, { s: '30', p: '3' }, { s: '30', p: '免费' }, { s: '30', p: '免费' }, { p: '30' }, { p: '30' }] },
  { name: 'Nano Banana', cells: [{ p: '30' }, { s: '30', p: '3' }, { p: '30' }, { s: '30', p: '3' }, { s: '30', p: '免费' }, { s: '30', p: '免费' }, { p: '30' }, { p: '30' }] },
  { name: 'Nano Banana Pro', cells: ['X', { s: '40', p: '4' }, 'X', { s: '40', p: '4' }, { p: '免费' }, { p: '免费' }, 'X', { p: '40' }] },
  { name: 'Nano Banana 2', cells: [{ p: '40' }, { s: '40', p: '4' }, { p: '40' }, { s: '40', p: '4' }, { s: '40', p: '免费' }, { s: '40', p: '免费' }, { p: '40' }, { p: '40' }] },
  { name: 'Veo 3', cells: [{ p: '100' }, { s: '100', p: '10' }, { p: '100' }, { s: '100', p: '10' }, { s: '100', p: '免费' }, { s: '100', p: '免费' }, { p: '100' }, { p: '100' }] },
  { name: 'Kling 2.5', cells: [{ p: '100' }, { s: '100', p: '10' }, { p: '100' }, { s: '100', p: '10' }, { s: '100', p: '免费' }, { s: '100', p: '免费' }, { p: '100' }, { p: '100' }] },
  { name: 'Kling 2.1 Pro', cells: [{ p: '120' }, { s: '120', p: '12' }, { p: '120' }, { s: '120', p: '12' }, { s: '120', p: '免费' }, { s: '120', p: '免费' }, { p: '120' }, { p: '120' }] },
  { name: 'Runway Gen 4', cells: [{ p: '100' }, { s: '100', p: '10' }, { p: '100' }, { s: '100', p: '10' }, { s: '100', p: '免费' }, { s: '100', p: '免费' }, { p: '100' }, { p: '100' }] },
  { name: 'Flux Kontext Pro', cells: [{ p: '30' }, { s: '30', p: '3' }, { p: '30' }, { s: '30', p: '3' }, { s: '30', p: '免费' }, { s: '30', p: '免费' }, { p: '30' }, { p: '30' }] },
  { name: 'Flux Kontext Max', cells: [{ p: '40' }, { s: '40', p: '4' }, { p: '40' }, { s: '40', p: '4' }, { s: '40', p: '免费' }, { s: '40', p: '免费' }, { p: '40' }, { p: '40' }] },
];

// 按「价格修改/模型分类.md」划分：视频模型在上、图像模型在下（组内保持现有顺序）
const VIDEO_MODEL_NAMES = new Set([
  'Seedance 2.5',
  'Seedance 2.0',
  'Seedance 2.0 Fast',
  'Seedance 2.0 Mini',
  'Veo 3 Premium',
  'Veo 3.1 Basic',
  'Veo 3.1 Premium',
  'Gemini Omni Flash 1.1',
  'Gemini Omni',
  'Wan 3.0',
  'Wan 3.0 Prime',
  'MiniMax H3',
  'Kling 2.1 Master',
  'LTX 2.5 Fast',
  'Seedance 1.5 Pro',
  'Veo 3.1 Lite',
  'Wan 2.5',
  'PixVerse V6',
  'Veo 3',
  'Kling 2.5',
  'Kling 2.1 Pro',
  'Runway Gen 4',
]);

const COMPARE_VIDEO_ROWS = COMPARE_ROWS.filter((row) =>
  VIDEO_MODEL_NAMES.has(row.name)
);
const COMPARE_IMAGE_ROWS = COMPARE_ROWS.filter(
  (row) => !VIDEO_MODEL_NAMES.has(row.name)
);

const COMPARE_GROUP_CLASS =
  'bg-muted px-6 py-3 text-left text-sm font-semibold text-foreground';

export function PricingCompareTable() {
  const t = useTranslations('pages.pricing.messages');
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const compareColumns = [
    {
      title: t('compare_starter'),
      subtitle: t('compare_monthly'),
      gradient: GRAD_STARTER,
      subscribe: true,
    },
    {
      title: t('compare_starter'),
      subtitle: t('compare_yearly'),
      gradient: GRAD_STARTER,
      highlight: true,
      subscribe: true,
    },
    {
      title: t('compare_pro'),
      subtitle: t('compare_monthly'),
      gradient: GRAD_PRO,
      subscribe: true,
    },
    {
      title: t('compare_pro'),
      subtitle: t('compare_yearly'),
      gradient: GRAD_PRO,
      highlight: true,
      subscribe: true,
    },
    {
      title: t('compare_unlimited'),
      subtitle: t('compare_monthly'),
      gradient: GRAD_UNLIMITED,
      subscribe: true,
    },
    {
      title: t('compare_unlimited'),
      subtitle: t('compare_yearly'),
      gradient: GRAD_UNLIMITED,
      highlight: true,
      subscribe: true,
    },
    {
      title: t('compare_onetime'),
      subtitle: t('compare_199'),
      gradient: GRAD_STARTER,
    },
    {
      title: t('compare_onetime'),
      subtitle: t('compare_499'),
      gradient: GRAD_PRO,
      highlight: true,
    },
  ];

  return (
    <section id="compare-plans" className="mb-12 w-full rounded-3xl p-4 sm:p-6 lg:p-8">
      <h2 className="landing-strong mb-6 text-center text-2xl font-bold sm:mb-8 sm:text-3xl">
        <span
          style={{
            background:
              'linear-gradient(148deg, #ffba6b 0%, #ffd685 40%, #fff5eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {t('compare_title')}
        </span>
      </h2>
      <div className="hidden overflow-x-auto lg:block">
        <table className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr className="border-b border-[hsl(var(--border))]">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                {t('compare_feature')}
              </th>
              {compareColumns.map((col, colIdx) => (
                <th
                  key={colIdx}
                  className={
                    col.highlight
                      ? 'relative rounded-lg bg-primary/10 px-6 py-4 text-center text-sm font-semibold'
                      : 'px-6 py-4 text-center text-sm font-semibold'
                  }
                >
                  {col.highlight && (
                    <div className="absolute right-0 top-0 z-10">
                      <span className="inline-block whitespace-nowrap rounded-md border border-primary bg-black px-1 text-[8px] font-semibold text-primary shadow-[0_0_4px_hsl(var(--primary)/0.6),0_0_8px_hsl(var(--primary)/0.4)]">
                        {t('compare_badge')}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col items-center gap-2">
                    <span
                      style={{
                        background: col.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {col.title}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {col.subtitle}
                    </span>
                    {col.subscribe && (
                      <div className="group relative mt-2">
                        <button
                          className="w-full min-w-[100px] rounded-lg px-3 py-2 text-xs font-semibold text-black shadow-sm transition-all duration-200 hover:opacity-90 hover:brightness-105"
                          style={{ background: GRAD_UNLIMITED }}
                        >
                          {t('compare_subscribe')}
                        </button>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {COMPARE_META_ROWS.map((row, rowIdx) => (
              <tr
                key={`meta-${rowIdx}`}
                className="border-b border-[hsl(var(--border))]"
              >
                <td className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  {t(row.labelKey)}
                </td>
                {row.cells.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    className={
                      compareColumns[colIdx].highlight
                        ? 'rounded-lg bg-primary/10 px-6 py-4 text-center'
                        : 'px-6 py-4 text-center'
                    }
                  >
                    {cell === 'X' ? (
                      <span className="text-sm text-muted-foreground">❌</span>
                    ) : (
                      (() => {
                        const isAccent =
                          // 价格 / 积分 / 并发：年费列
                          ((rowIdx === 0 || rowIdx === 1 || rowIdx === 2) &&
                            (colIdx === 1 || colIdx === 3 || colIdx === 5)) ||
                          // 无水印：全部
                          rowIdx === 3 ||
                          // 商业许可证：有许可证的
                          (rowIdx === 4 && cell.p !== 'X') ||
                          // 折扣：节省 90% / 节省 100%
                          (rowIdx === 5 &&
                            (cell.p === 'compare_disc_90' ||
                              cell.p === 'compare_disc_100'));
                        return (
                          <span
                            className={cn(
                              'whitespace-nowrap text-sm text-foreground',
                              isAccent && 'font-medium text-primary'
                            )}
                          >
                            {cell.p.startsWith('compare_') ? t(cell.p) : cell.p}
                            {cell.sub &&
                              cell.sub.map((line, lineIdx) => (
                                <span
                                  key={lineIdx}
                                  className={cn(
                                    'block text-xs',
                                    rowIdx === 0 &&
                                      (colIdx === 1 ||
                                        colIdx === 3 ||
                                        colIdx === 5)
                                      ? 'text-primary'
                                      : 'text-muted-foreground'
                                  )}
                                >
                                  {line.startsWith('compare_') ? t(line) : line}
                                </span>
                              ))}
                          </span>
                        );
                      })()
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td colSpan={9} className={COMPARE_GROUP_CLASS}>
                {t('compare_group_video')}
              </td>
            </tr>
            {COMPARE_VIDEO_ROWS.map((row, rowIdx) => (
              <tr
                key={`video-${rowIdx}`}
                className="border-b border-[hsl(var(--border))]"
              >
                <td className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  {row.name}
                </td>
                {row.cells.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    className={
                      compareColumns[colIdx].highlight
                        ? 'rounded-lg bg-primary/10 px-6 py-4 text-center'
                        : 'px-6 py-4 text-center'
                    }
                  >
                    {cell === 'X' ? (
                      <span className="text-sm text-muted-foreground">❌</span>
                    ) : (
                      <span className="whitespace-nowrap text-sm">
                        {cell.s && (
                          <span className="mr-1 text-muted-foreground line-through">
                            {cell.s}
                          </span>
                        )}
                        <span
                          className={
                            cell.s
                              ? 'font-medium text-primary'
                              : 'text-foreground'
                          }
                        >
                          {cell.p}
                        </span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td colSpan={9} className={COMPARE_GROUP_CLASS}>
                {t('compare_group_image')}
              </td>
            </tr>
            {COMPARE_IMAGE_ROWS.map((row, rowIdx) => (
              <tr
                key={`image-${rowIdx}`}
                className="border-b border-[hsl(var(--border))]"
              >
                <td className="px-6 py-4 text-left text-sm font-medium text-foreground">
                  {row.name}
                </td>
                {row.cells.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    className={
                      compareColumns[colIdx].highlight
                        ? 'rounded-lg bg-primary/10 px-6 py-4 text-center'
                        : 'px-6 py-4 text-center'
                    }
                  >
                    {cell === 'X' ? (
                      <span className="text-sm text-muted-foreground">❌</span>
                    ) : (
                      <span className="whitespace-nowrap text-sm">
                        {cell.s && (
                          <span className="mr-1 text-muted-foreground line-through">
                            {cell.s}
                          </span>
                        )}
                        <span
                          className={
                            cell.s
                              ? 'font-medium text-primary'
                              : 'text-foreground'
                          }
                        >
                          {cell.p}
                        </span>
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* 移动端：每套餐一张折叠卡片，只显示权益，不显示模型 */}
      <div className="space-y-3 lg:hidden">
        {compareColumns.map((col, colIdx) => {
          const priceCell = COMPARE_META_ROWS[0].cells[colIdx];
          const benefitRows = COMPARE_META_ROWS.slice(1);
          const isOpen = openIdx === colIdx;
          return (
            <div
              key={colIdx}
              className="overflow-hidden rounded-xl border-2 border-[hsl(var(--border))] bg-[hsl(var(--surface-1))] transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : colIdx)}
                className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-[hsl(var(--surface-2))]"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3
                      className="text-lg font-bold"
                      style={{
                        background: col.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      {col.title}
                    </h3>
                    {col.highlight && (
                      <span className="rounded-md border border-primary bg-black px-1.5 py-0.5 text-[10px] font-semibold text-primary shadow-[0_0_4px_hsl(var(--primary)/0.6)]">
                        {t('compare_badge')}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {col.subtitle}
                  </p>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-foreground">
                      {priceCell === 'X'
                        ? '—'
                        : priceCell.p.startsWith('compare_')
                          ? t(priceCell.p)
                          : priceCell.p}
                    </span>
                    {priceCell !== 'X' &&
                      priceCell.sub?.map((line, lineIdx) => (
                        <span
                          key={lineIdx}
                          className="text-sm text-muted-foreground"
                        >
                          {line.startsWith('compare_') ? t(line) : line}
                        </span>
                      ))}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    'h-5 w-5 shrink-0 text-muted-foreground transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
              {isOpen && (
                <div className="border-t border-[hsl(var(--border))] p-4">
                  <ul className="space-y-2">
                    {benefitRows.map((row, rowIdx) => {
                      const cell = row.cells[colIdx];
                      return (
                        <li
                          key={rowIdx}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <span className="text-muted-foreground">
                            {t(row.labelKey)}
                          </span>
                          {cell === 'X' ? (
                            <span className="text-muted-foreground">❌</span>
                          ) : (
                            <span className="font-medium text-foreground">
                              {cell.p.startsWith('compare_')
                                ? t(cell.p)
                                : cell.p}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
