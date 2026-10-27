import { setRequestLocale } from 'next-intl/server';

import { nanoBananaProModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.nano-banana-pro.metadata',
  canonicalUrl: '/nano-banana-pro',
});

export default async function NanoBananaProPage({
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
      config={nanoBananaProModelPageConfig}
      promptKey={promptKey}
    />
  );
}
