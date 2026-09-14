import { setRequestLocale } from 'next-intl/server';

import { aiVideoGeneratorPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'ai.video.metadata',
  canonicalUrl: '/ai-video-generator',
});

export default async function AiVideoGeneratorPage({
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
      config={aiVideoGeneratorPageConfig}
      promptKey={promptKey}
    />
  );
}
