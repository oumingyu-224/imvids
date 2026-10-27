'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronLeft, ChevronRight, Copy, Wand, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { LazyImage } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export type ShowcaseItem = {
  description?: string | null;
  id: string;
  title: string;
  prompt?: string | null;
  image: string;
  video?: string | null;
  createdAt: string | Date;
};

function getPromptPreview(prompt?: string | null) {
  return prompt?.replace(/\s+/g, ' ').trim() ?? '';
}

export function ShowcasesFlowDynamic({
  id,
  title,
  description,
  className,
  containerClassName,
  tags,
  excludeTags,
  searchTerm,
  hideCreateButton = false,
  showDescription = false,
  enableLimit = false,
  sortOrder = 'desc',
  initialItems,
  usePrompts = false,
}: {
  id?: string;
  title?: string;
  description?: string;
  className?: string;
  containerClassName?: string;
  tags?: string;
  excludeTags?: string;
  searchTerm?: string;
  hideCreateButton?: boolean;
  showDescription?: boolean;
  enableLimit?: boolean;
  sortOrder?: 'asc' | 'desc';
  initialItems?: ShowcaseItem[];
  usePrompts?: boolean;
}) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialItems || []);
  const t = useTranslations('pages.showcases.ui');
  const [loading, setLoading] = useState(!initialItems);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // BUG-07：hover 播放视频用
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  // Track if this is the initial mount to possibly skip fetching
  const isInitialMount = useState(true);

  useEffect(() => {
    // If initialItems are provided, skip the first fetch
    if (initialItems && isInitialMount[0]) {
      isInitialMount[1](false);
      return;
    }
    
    console.log('ShowcasesFlowDynamic mounted (or updated) with props:', { tags, excludeTags, searchTerm });
    
    // Set loading state when tags/searchTerm changes
    setLoading(true);
    setShowLoading(false);
    setError(null);
    
    // Only show loading indicator after 300ms delay
    const loadingTimer = setTimeout(() => {
      // If we are still loading, show the indicator
      // We check the loading state inside the effect's closure, 
      // but since we just set it true above, we need to be careful.
      // Actually, relying on state update cycle, better to just set it true here
      // but guard against fast completion.
      setShowLoading(true);
    }, 300);
    
    const params = new URLSearchParams();
    if (enableLimit) {
      params.append('limit', '20');
    }
    params.append('sortOrder', sortOrder);
    params.append('_t', Date.now().toString()); // Cache busting
    if (tags) params.append('tags', tags);
    if (excludeTags) params.append('excludeTags', excludeTags);
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (usePrompts) params.append('usePrompts', 'true');

    const url = `/api/showcases/latest?${params.toString()}`;
    // console.log('Fetching URL:', url);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log('Showcases API response:', data);
        if (data.code === 0 && data.data) {
          setItems(data.data);
        } else {
          console.error('Showcases API did not return success:', data);
          setError(data.message || 'API Error');
        }
      })
      .catch((error) => {
        console.error('Failed to fetch showcases:', error);
        setError(error.message);
      })
      .finally(() => {
        clearTimeout(loadingTimer);
        setLoading(false);
        setShowLoading(false);
      });
    
    return () => clearTimeout(loadingTimer);
  }, [tags, excludeTags, searchTerm, enableLimit, sortOrder, initialItems, usePrompts]);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev === 0 ? items.length - 1 : prev - 1) : null
    );
  }, [items.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev === items.length - 1 ? 0 : prev + 1) : null
    );
  }, [items.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrevious, handleNext]);

  const selectedItem =
    selectedIndex !== null && items[selectedIndex] ? items[selectedIndex] : null;

  const getTryPromptHref = useCallback((prompt?: string | null) => {
    return prompt ? `/?prompt=${encodeURIComponent(prompt)}#generator` : '/#generator';
  }, []);

  const copyPrompt = useCallback(
    async (prompt?: string | null, itemId?: string) => {
      if (!prompt || !itemId) {
        toast.error(t('no_prompt'));
        return;
      }

      try {
        await navigator.clipboard.writeText(prompt);
        setCopiedId(itemId);
        toast.success(t('copied_prompt'));
        window.setTimeout(() => {
          setCopiedId((current) => (current === itemId ? null : current));
        }, 1600);
      } catch (error) {
        toast.error(t('copy_failed'));
      }
    },
    [t]
  );

  const handleCopyPrompt = useCallback(async () => {
    if (!selectedItem) return;
    await copyPrompt(selectedItem.prompt, selectedItem.id);
  }, [copyPrompt, selectedItem]);

  const handleTryPrompt = useCallback(() => {
    const href = getTryPromptHref(selectedItem?.prompt);
    setSelectedIndex(null);
    window.location.href = href;
  }, [getTryPromptHref, selectedItem?.prompt]);

  return (
    <section id={id} className={cn('pb-24 md:pb-36', className)}>
      {(title || description) && (
        <motion.div
          className="container mb-12 text-center pt-24 md:pt-36"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          {title && (
            <h2 className="mx-auto mb-6 max-w-full text-3xl font-bold text-pretty md:max-w-5xl lg:text-4xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground text-md mx-auto mb-4 line-clamp-3 max-w-full md:max-w-5xl">
              {description}
            </p>
          )}
        </motion.div>
      )}
      {loading || showLoading ? (
        showLoading && (
          <div className={cn("container text-center my-30", containerClassName)}>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        )
      ) : error ? (
        <div className={cn("container text-center text-red-500", containerClassName)}>
           <p>Error loading: {error}</p>
        </div>
      ) : items.length > 0 ? (
        <div className={cn("container mx-auto columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3 xl:columns-4", containerClassName)}>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              className="group relative cursor-zoom-in break-inside-avoid overflow-hidden rounded-xl"
              onClick={() => setSelectedIndex(index)}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              whileHover={{ scale: 1.02 }}
              onMouseEnter={() => {
                // BUG-07：hover 时播放视频预览
                const video = videoRefs.current[index];
                if (video) {
                  video.play().catch(() => {});
                }
              }}
              onMouseLeave={() => {
                const video = videoRefs.current[index];
                if (video) {
                  video.pause();
                }
              }}
            >
              <LazyImage
                src={item.image}
                alt={item.title}
                className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
              {item.video ? (
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={item.video}
                  poster={item.image}
                  muted
                  loop
                  playsInline
                  preload="none"
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/28 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 px-3 pb-3 opacity-0 transition-all duration-300 group-hover:pointer-events-auto group-hover:opacity-100">
                <div className="translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                  <p className="line-clamp-2 text-[13px] leading-6 text-white/96 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
                    {getPromptPreview(item.prompt) || item.title}
                  </p>
                  {!hideCreateButton && (
                    <div
                      className="mt-3 flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!item.prompt}
                        onClick={() => copyPrompt(item.prompt, item.id)}
                        className="h-9 flex-1 rounded-xl border-white/22 bg-black/18 text-[13px] font-medium text-white backdrop-blur-md hover:border-white/34 hover:bg-black/28 hover:text-white dark:border-white/22 dark:bg-black/18 dark:text-white dark:hover:border-white/34 dark:hover:bg-black/28"
                      >
                        {copiedId === item.id ? (
                          <Check className="size-4" />
                        ) : (
                          <Copy className="size-4" />
                        )}
                        {t('copy_prompt')}
                      </Button>
                      <Button
                        asChild
                        size="sm"
                        className="h-9 flex-1 rounded-xl bg-[#1773ea] px-3 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(23,115,234,0.35)] hover:bg-[#1569d5] dark:bg-[#1773ea] dark:text-white dark:hover:bg-[#1569d5]"
                      >
                        <Link href={getTryPromptHref(item.prompt)} target="_self">
                          <Wand className="size-4" />
                          {t('try_now')}
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          className={cn("text-muted-foreground container text-center mt-20", containerClassName)}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {searchTerm ? (
            // BUG-16：搜索态空结果与「库为空」区分展示
            <div className="flex flex-col items-center gap-3">
              <span>{t('no_results_for', { term: searchTerm })}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('searchTerm');
                    window.location.replace(
                      url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '')
                    );
                  }
                }}
              >
                {t('clear_search')}
              </Button>
            </div>
          ) : (
            'No items found in this category.'
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedIndex !== null && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md md:p-8"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-4 right-4 z-50 rounded-full bg-black/10 p-1 text-white/70 transition-colors hover:bg-black/20 hover:text-white dark:bg-white/10 dark:hover:bg-white/20"
              onClick={() => setSelectedIndex(null)}
            >
              <X className="size-8" />
            </button>

            <button
              className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-white/85 p-2 text-slate-500 shadow-lg transition-colors hover:bg-white hover:text-[#1773ea] dark:bg-[#111827]/85 dark:text-slate-300 dark:hover:bg-[#111827] dark:hover:text-sky-300"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
            >
              <ChevronLeft className="size-8 md:size-12" />
            </button>

            <button
              className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-white/85 p-2 text-slate-500 shadow-lg transition-colors hover:bg-white hover:text-[#1773ea] dark:bg-[#111827]/85 dark:text-slate-300 dark:hover:bg-[#111827] dark:hover:text-sky-300"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="size-8 md:size-12" />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative flex h-full w-full items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid h-[min(88vh,860px)] w-full max-w-[1440px] overflow-hidden rounded-[28px] bg-white shadow-[0_28px_80px_rgba(15,23,42,0.26)] md:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.78fr)] dark:bg-[#0f172a]">
                <div className="relative h-full min-h-[320px] overflow-hidden bg-white dark:bg-white">
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={items[selectedIndex].image}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full scale-110 object-cover opacity-55 blur-2xl saturate-115"
                    />
                    <div className="absolute inset-0 bg-white/18 dark:bg-white/6" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <img
                      src={items[selectedIndex].image}
                      alt={items[selectedIndex].title}
                      className="block h-full max-h-full w-full max-w-full object-contain"
                    />
                  </div>
                </div>

                <div className="flex min-h-0 flex-col border-t border-slate-200 bg-white md:border-t-0 md:border-l dark:border-white/10 dark:bg-[#0f172a]">
                  <div className="flex items-start gap-4 px-7 pt-7 pb-5">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">
                        {items[selectedIndex].title}
                      </h3>
                      {showDescription && items[selectedIndex].description ? (
                        <p className="mt-4 text-base leading-8 whitespace-pre-wrap text-slate-600 dark:text-slate-300">
                          {items[selectedIndex].description}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-7 pb-6">
                    {items[selectedIndex].prompt ? (
                      <p className="text-[17px] leading-9 whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                        {items[selectedIndex].prompt}
                      </p>
                    ) : (
                      <div className="text-[15px] text-slate-500 dark:text-slate-400">
                        {t('no_prompt')}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-200 px-7 py-5 dark:border-white/10">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCopyPrompt}
                        disabled={!selectedItem?.prompt}
                        className="h-13 flex-1 rounded-2xl border-slate-200 bg-white text-base font-medium text-slate-700 hover:border-sky-200 hover:bg-sky-500/10 hover:text-[#1773ea] dark:border-white/10 dark:bg-transparent dark:text-slate-200 dark:hover:border-sky-400/20 dark:hover:bg-sky-400/10 dark:hover:text-sky-300"
                      >
                        {copiedId === selectedItem?.id ? (
                          <Check className="size-5" />
                        ) : (
                          <Copy className="size-5" />
                        )}
                        {t('copy_prompt')}
                      </Button>

                      <Button
                        type="button"
                        onClick={handleTryPrompt}
                        className="h-13 flex-1 rounded-2xl bg-[#1773ea] text-base font-semibold text-white hover:bg-[#1569d5] dark:bg-[#1773ea] dark:text-white dark:hover:bg-[#1569d5]"
                      >
                        <Wand className="size-5" />
                        {t('try_now')}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
