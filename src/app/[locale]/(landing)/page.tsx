import { setRequestLocale } from 'next-intl/server';

import { homeLandingPageConfig } from '@/config/landing-pages';
import { envConfigs } from '@/config';
import { JsonLd } from '@/shared/blocks/common/json-ld';

import { LandingPageRenderer } from './landing-page-renderer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 首页 JSON-LD：Organization + WebSite + SoftwareApplication（三档真实价格）
function buildHomeJsonLd() {
  const appName = envConfigs.app_name || 'Oddbeam';
  const appUrl = envConfigs.app_url;
  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: appName,
          url: appUrl,
          logo: `${appUrl}/logo.png`,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: appName,
          url: appUrl,
        }}
      />
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: appName,
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Web',
          url: appUrl,
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: '29.99',
            highPrice: '149.99',
            offerCount: 3,
            offers: [
              {
                '@type': 'Offer',
                name: 'Starter',
                price: '29.99',
                priceCurrency: 'USD',
              },
              {
                '@type': 'Offer',
                name: 'Pro',
                price: '89.99',
                priceCurrency: 'USD',
              },
              {
                '@type': 'Offer',
                name: 'Unlimited',
                price: '149.99',
                priceCurrency: 'USD',
              },
            ],
          },
        }}
      />
    </>
  );
}

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
    <>
      {buildHomeJsonLd()}
      <LandingPageRenderer
        locale={locale}
        config={homeLandingPageConfig}
        promptKey={promptKey}
      />
    </>
  );
}
