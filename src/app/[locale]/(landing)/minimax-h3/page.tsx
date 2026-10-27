import { setRequestLocale } from 'next-intl/server';

import { minimaxH3ModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.minimax-h3.metadata',
  canonicalUrl: '/minimax-h3',
});

export default async function MinimaxH3Page({
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
      config={minimaxH3ModelPageConfig}
      promptKey={promptKey}
    />
  );
}
