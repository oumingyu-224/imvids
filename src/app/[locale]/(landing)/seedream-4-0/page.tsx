import { setRequestLocale } from 'next-intl/server';

import { seedream40ModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.seedream-4-0.metadata',
  canonicalUrl: '/seedream-4-0',
});

export default async function Seedream40Page({
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
      config={seedream40ModelPageConfig}
      promptKey={promptKey}
    />
  );
}
