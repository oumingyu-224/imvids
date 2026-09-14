import { setRequestLocale } from 'next-intl/server';

import { homeLandingPageConfig } from '@/config/landing-pages';

import { LandingPageRenderer } from './landing-page-renderer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LandingPage({
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
      config={homeLandingPageConfig}
      promptKey={promptKey}
    />
  );
}
