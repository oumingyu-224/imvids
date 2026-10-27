import { setRequestLocale } from 'next-intl/server';

import { wan30ModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.wan-3-0.metadata',
  canonicalUrl: '/wan-3-0',
});

export default async function Wan30Page({
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
      config={wan30ModelPageConfig}
      promptKey={promptKey}
    />
  );
}
