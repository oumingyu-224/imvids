import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { FaqByMode } from '@/shared/blocks/common/faq-by-mode';
import { ImageGenerator } from '@/shared/blocks/generator';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const generateMetadata = getMetadata({
  metadataKey: 'pages.create.metadata',
  canonicalUrl: '/create',
});

export default async function CreatePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ prompt?: string }>;
}) {
  const { locale } = await params;
  const { prompt: promptKey } = await searchParams;
  setRequestLocale(locale);

  // get ai image data
  const t = await getTranslations('pages.create');

  // get landing page data for FAQ
  const tl = await getTranslations('landing');

  // build page sections
  const page: DynamicPage = {
    sections: {
      "features": {
        "block": "custom-features",
        sr_only_title: t.raw('page.title'),
        title: t.raw('page.title'),
        description: t.raw('page.description'),
      },
      generator: {
        component: <ImageGenerator srOnlyTitle={t.raw('generator.title')} promptKey={promptKey} />,
      },
      faq: {
        // BUG-12：FAQ 随生成器模式（图片/视频）切换
        component: (
          <FaqByMode
            imageSection={{
              block: 'faq',
              id: 'faq',
              title: tl.raw('faq.title'),
              items: tl.raw('faq.items'),
            }}
            videoSection={{
              block: 'faq',
              id: 'faq',
              title: tl.raw('faq.title'),
              items: tl.raw('faq.video_items'),
            }}
          />
        ),
      },
    },
  };

  // load page component
  const Page = await getThemePage('dynamic-page');

  return <Page locale={locale} page={page} />;
}
