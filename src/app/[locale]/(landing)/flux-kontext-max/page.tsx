import { setRequestLocale } from 'next-intl/server';

import { fluxKontextMaxModelPageConfig } from '@/config/landing-pages';
import { getMetadata } from '@/shared/lib/seo';

import { LandingPageRenderer } from '../landing-page-renderer';

export const generateMetadata = getMetadata({
  metadataKey: 'models.flux-kontext-max.metadata',
  canonicalUrl: '/flux-kontext-max',
});

export default async function FluxKontextMaxPage({
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
      config={fluxKontextMaxModelPageConfig}
      promptKey={promptKey}
    />
  );
}
