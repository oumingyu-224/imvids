import { setRequestLocale } from 'next-intl/server';

import { veo31ModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.veo-3-1.metadata',
  canonicalUrl: '/veo-3-1',
});

export default async function Veo31Page({
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
      config={veo31ModelPageConfig}
      promptKey={promptKey}
    />
  );
}
