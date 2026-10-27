import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { VideoGenerator } from '@/shared/blocks/generator';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const generateMetadata = getMetadata({
  metadataKey: 'pages.seedance2free.metadata',
  canonicalUrl: '/seedance-2-free',
});

export default async function Seedance2FreePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.seedance2free');

  const page: DynamicPage = {
    sections: {
      features: {
        block: 'custom-features',
        title: t.raw('page.title'),
        description: t.raw('page.description'),
      },
      generator: {
        component: (
          <VideoGenerator
            srOnlyTitle={t.raw('generator.title')}
            defaultModel="seedance-2-0-mini"
          />
        ),
      },
      faq: {
        block: 'faq',
        title: t.raw('faq.title'),
        items: t.raw('faq.items'),
      },
    },
  };

  const Page = await getThemePage('dynamic-page');

  return <Page locale={locale} page={page} />;
}
