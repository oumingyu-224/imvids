import { setRequestLocale } from 'next-intl/server';

import { nanoBanana2ModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.nano-banana-2.metadata',
  canonicalUrl: '/nano-banana-2',
});

export default async function NanoBanana2Page({
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
      config={nanoBanana2ModelPageConfig}
      promptKey={promptKey}
    />
  );
}
