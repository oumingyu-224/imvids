'use client';

import { useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Lock, Search } from 'lucide-react';
import { useLocale } from 'next-intl';

import zhModelMessages from '@/config/locale/messages/zh/ai/models.json';
import enModelMessages from '@/config/locale/messages/en/ai/models.json';
import { Link } from '@/core/i18n/navigation';
import { cn } from '@/shared/lib/utils';
import {
  getModelsByMode,
  type GeneratorMode,
  type GeneratorModel,
} from './models';

interface ModelSelectProps {
  mode: GeneratorMode;
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

interface ModelMessage {
  badges: string[];
  description: string;
  capabilities: string[];
}

interface ModelMessages {
  ui: {
    select_model: string;
    search_placeholder: string;
    no_match: string;
    locked_label: string;
    locked_action: string;
    recommended: string;
  };
  models: Record<string, ModelMessage>;
}

export function ModelSelect({ mode, value, onChange, className }: ModelSelectProps) {
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const dict = useMemo(
    () =>
      (locale.startsWith('zh')
        ? zhModelMessages
        : enModelMessages) as unknown as ModelMessages,
    [locale]
  );

  const models = useMemo(() => getModelsByMode(mode), [mode]);

  const filteredModels = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return models;
    return models.filter(
      (model) =>
        model.name.toLowerCase().includes(kw) ||
        model.description.toLowerCase().includes(kw)
    );
  }, [models, keyword]);

  const currentModel = models.find((model) => model.id === value) ?? models[0];

  const handleSelect = (model: GeneratorModel) => {
    if (model.locked) return;
    onChange(model.id);
    setOpen(false);
    setKeyword('');
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      {/* 模型选择按钮 */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex h-9 w-full items-center gap-1 whitespace-nowrap rounded-md border border-border/50 bg-card px-3 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-card-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:w-auto"
      >
        {currentModel ? (
          <>
            <span className="flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentModel.icon}
                alt={currentModel.name}
                className="h-6 w-6"
              />
            </span>
            <span className="truncate text-highlight">{currentModel.name}</span>
          </>
        ) : (
          <span className="text-highlight">{dict.ui.select_model}</span>
        )}
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>

      {/* 弹层 */}
      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => {
              setOpen(false);
              setKeyword('');
            }}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-[363px] max-w-[calc(100vw-2rem)] rounded-md border border-border/50 bg-[#111] p-0 shadow-2xl outline-none">
            {/* 搜索框 */}
            <div className="flex items-center border-b border-border/30 px-4 py-3">
              <Search className="mr-2 h-4 w-4 text-muted-foreground" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder={dict.ui.search_placeholder}
                type="text"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-muted-foreground"
              />
            </div>

            {/* 模型列表 */}
            <div className="custom-scrollbar flex max-h-[60vh] flex-col overflow-auto">
              {filteredModels.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {dict.ui.no_match}
                </p>
              ) : (
                filteredModels.map((model) => (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => handleSelect(model)}
                    className={cn(
                      'relative flex w-full flex-col border-b border-border/50 p-4 pr-2 text-left transition-all duration-200 hover:bg-[#222]',
                      model.locked && 'cursor-pointer grayscale',
                      model.id === value &&
                        !model.locked &&
                        'border-l-2 border-l-highlight bg-[#1a1a1a]'
                    )}
                  >
                    {model.locked ? (
                      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/60 backdrop-blur-sm">
                        <Lock className="h-5 w-5 text-highlight" />
                        <span className="text-sm font-semibold text-highlight">
                          {dict.ui.locked_label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          <Link
                            href={`/pricing#${model.pricing.tierAnchor}`}
                            className="underline underline-offset-2 hover:text-highlight"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpen(false);
                              setKeyword('');
                            }}
                          >
                            {dict.ui.locked_action}
                          </Link>
                        </span>
                      </div>
                    ) : null}

                    {/* 名称行 */}
                    <div className="relative z-10 mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={model.icon}
                            alt={model.name}
                            className="h-6 w-6"
                          />
                        </div>
                        <span
                          className={cn(
                            'text-lg font-medium',
                            model.id === value && !model.locked
                              ? 'text-highlight'
                              : 'text-white'
                          )}
                        >
                          {model.name}
                        </span>
                        {(dict.models[model.id]?.badges ?? model.badges).map(
                          (badge) => (
                            <span
                              key={badge}
                              className="rounded-full border border-highlight-hover/30 bg-highlight-hover/20 px-2 py-1 text-xs font-medium text-highlight-hover"
                            >
                              {badge}
                            </span>
                          )
                        )}
                      </div>
                      {model.id === value && !model.locked ? (
                        <Check className="ml-auto h-5 w-5 text-highlight" />
                      ) : null}
                    </div>

                    {/* 描述 */}
                    <p className="relative z-10 mb-3 text-sm text-muted-foreground">
                      {dict.models[model.id]?.description ?? model.description}
                    </p>

                    {/* 能力 chips */}
                    <div className="relative z-10 mb-3 flex flex-wrap gap-2">
                      {(
                        dict.models[model.id]?.capabilities ??
                        model.capabilities
                      ).map((capability) => (
                        <div
                          key={capability}
                          className="flex items-center rounded-xl border border-border/50 bg-card px-2 py-1"
                        >
                          <div className="text-xs font-medium text-white">
                            {capability}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* 推荐标 */}
                    {model.recommended ? (
                      <div className="relative z-10 flex items-center justify-end">
                        <span className="flex items-center gap-1 rounded bg-highlight/10 px-2 py-1 text-xs font-medium text-highlight">
                          ⭐ {dict.ui.recommended}
                        </span>
                      </div>
                    ) : (
                      <div className="relative z-10 flex items-center justify-end" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
