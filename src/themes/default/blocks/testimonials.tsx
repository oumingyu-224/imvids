'use client';

import { Star } from 'lucide-react';

import { LazyImage } from '@/shared/blocks/common';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section, SectionItem } from '@/shared/types/blocks/landing';

export function Testimonials({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const items = section.items ?? [];

  const TestimonialCard = ({ item }: { item: SectionItem }) => {
    return (
      <div className="w-[290px] shrink-0 rounded-[26px] border border-slate-200/80 bg-white p-6 shadow-[0_14px_34px_rgba(15,23,42,0.05)] dark:border-white/6 dark:bg-[#0b0b0f] dark:shadow-none md:w-[308px]">
        <div className="mb-5 flex items-center gap-1 text-amber-400">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              size={12}
              className="fill-current stroke-current"
            />
          ))}
        </div>
        <p className='text-foreground min-h-[96px] text-[13px] leading-6 before:mr-1 before:content-["\201C"] after:ml-1 after:content-["\201D"] md:text-sm'>
          {item.quote || item.description}
        </p>
        <div className="mt-6 flex items-center gap-3">
          <div className="aspect-square size-10 overflow-hidden rounded-full border border-slate-200/80 bg-white shadow-[0_6px_18px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#121318] dark:shadow-none">
            <LazyImage
              src={item.image?.src || item.avatar?.src || ''}
              alt={item.image?.alt || item.avatar?.alt || item.name || ''}
              className="h-full w-full object-cover"
            />
          </div>
          <h3 className="sr-only">
            {item.name}, {item.role || item.title}
          </h3>
          <div className="space-y-0.5">
            <p className="text-foreground text-sm font-semibold">
              {item.name}
            </p>
            <p className="text-muted-foreground text-[11px]">
              {item.role || item.title}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      id={section.id}
      className={cn('py-20 md:py-28', section.className, className)}
    >
      <div className="container px-3 sm:px-6">
        <ScrollAnimation>
          <div className="mx-auto max-w-3xl text-center text-balance">
            <h2 className="text-foreground mb-4 text-[28px] leading-[1.06] font-semibold tracking-[-0.04em] md:text-[42px]">
              {section.title}
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-sm leading-6 md:text-[15px] md:leading-7">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>
        <ScrollAnimation delay={0.2}>
          <div className="relative left-1/2 mt-12 w-screen -translate-x-1/2 overflow-hidden bg-transparent md:mt-16">
            <style jsx global>{`
              @keyframes testimonials-marquee {
                from {
                  transform: translate3d(0, 0, 0);
                }
                to {
                  transform: translate3d(calc(-100% - 1.5rem), 0, 0);
                }
              }
            `}</style>
            <div
              className="flex w-max gap-6 will-change-transform"
              style={{ animation: 'testimonials-marquee 48s linear infinite' }}
            >
              {/* 双份拼接：配合 translate3d(calc(-100% - 1.5rem)) 实现无缝循环滚动 */}
              {[...items, ...items].map((item, index) => (
                <TestimonialCard
                  key={`testimonial-${index}`}
                  item={item}
                />
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
