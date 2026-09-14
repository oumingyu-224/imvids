import { setRequestLocale } from 'next-intl/server';

import { aiImageGeneratorPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'ai.image.metadata',
  canonicalUrl: '/ai-image-generator',
});

export default async function AiImageGeneratorPage({
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
      config={aiImageGeneratorPageConfig}
      promptKey={promptKey}
    />
  );
}
