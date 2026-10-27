import { setRequestLocale } from 'next-intl/server';

import { seedance20ModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.seedance-2-0.metadata',
  canonicalUrl: '/seedance-2-0',
});

export default async function Seedance20Page({
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
      config={seedance20ModelPageConfig}
      promptKey={promptKey}
    />
  );
}
