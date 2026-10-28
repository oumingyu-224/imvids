import { setRequestLocale } from 'next-intl/server';

import { grokImagineImageModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.grok-imagine-image.metadata',
  canonicalUrl: '/grok-imagine-image',
});

export default async function GrokImagineImagePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ prompt?: string }>;
}) {
  const { locale } = await params;
  const { prompt: promptKey } = await searchParams;
  setRequestLocale(locale);

  return (
    <LandingPageRenderer
      locale={locale}
      config={grokImagineImageModelPageConfig}
      promptKey={promptKey}
    />
  );
}
