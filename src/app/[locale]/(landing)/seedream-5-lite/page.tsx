import { setRequestLocale } from 'next-intl/server';

import { seedream5LiteModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.seedream-5-lite.metadata',
  canonicalUrl: '/seedream-5-lite',
});

export default async function Seedream5LitePage({
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
      config={seedream5LiteModelPageConfig}
      promptKey={promptKey}
    />
  );
}
