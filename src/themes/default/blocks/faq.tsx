'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function FAQ({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('py-16 md:py-24', section.className, className)}
    >
      <div className={`mx-auto max-w-full px-4 md:max-w-3xl md:px-8`}>
        <ScrollAnimation>
          <div className="mx-auto max-w-2xl text-center text-balance">
            <h2 className="landing-title mb-4 text-3xl font-semibold tracking-tight md:text-4xl">
              {section.title}
            </h2>
            <p className="landing-body mb-6 md:mb-12 lg:mb-16">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="mx-auto mt-12 max-w-full">
            <Accordion
              type="single"
              collapsible
              className="landing-panel relative w-full rounded-2xl border p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_0_28px_rgba(94,114,255,0.14),0_0_52px_rgba(245,120,255,0.10)]"
            >
              <div className="pointer-events-none absolute inset-x-10 -top-px h-px bg-[linear-gradient(90deg,transparent,rgba(120,132,255,0.7),rgba(243,122,255,0.65),transparent)]" />
              {section.items?.map((item, idx) => (
                <div className="group" key={idx}>
                  <AccordionItem
                    value={item.question || item.title || ''}
                    className="peer rounded-xl border-none bg-transparent px-7 py-1 data-[state=open]:border-none data-[state=open]:bg-transparent data-[state=open]:shadow-none"
                  >
                    <AccordionTrigger className="landing-strong cursor-pointer text-base hover:no-underline">
                      {item.question || item.title || ''}
                    </AccordionTrigger>
                    {/* forceMount：答案始终进服务端 HTML（SEO），收起态由 CSS 隐藏 */}
                    <AccordionContent
                      forceMount
                      className="data-[state=closed]:hidden"
                    >
                      <p className="landing-body text-base">
                        {item.answer || item.description || ''}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  <hr className="landing-divider mx-7 border-dashed group-last:hidden" />
                </div>
              ))}
            </Accordion>

            <p
              className="landing-body mt-6 px-8"
              dangerouslySetInnerHTML={{ __html: section.tip || '' }}
            />
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
