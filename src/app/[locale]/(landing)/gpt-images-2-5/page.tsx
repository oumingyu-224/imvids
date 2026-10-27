import { setRequestLocale } from 'next-intl/server';

import { gptImages25ModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.gpt-images-2-5.metadata',
  canonicalUrl: '/gpt-images-2-5',
});

export default async function GptImages25Page({
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
      config={gptImages25ModelPageConfig}
      promptKey={promptKey}
    />
  );
}
