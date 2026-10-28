import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { getMetadata } from '@/shared/lib/seo';
import { Breadcrumbs } from '@/shared/blocks/common/breadcrumbs';
import { getCurrentSubscription } from '@/shared/models/subscription';
import { getUserInfo } from '@/shared/models/user';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const generateMetadata = getMetadata({
  metadataKey: 'pages.pricing.metadata',
  canonicalUrl: '/pricing',
});

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // get current subscription
  let currentSubscription;
  try {
    const user = await getUserInfo();
    if (user) {
      currentSubscription = await getCurrentSubscription(user.id);
    }
  } catch (error) {
    console.log('getting current subscription failed:', error);
  }

  // get pricing data
  const t = await getTranslations('pages.pricing');

  // get landing data
  const tl = await getTranslations('landing');

  // build page sections
  const page: DynamicPage = {
    sections: {
      pricing: {
        block: 'pricing',
        data: {
          pricing: t.raw('pricing'),
          currentSubscription,
        },
      },
      faq: tl.raw('faq'),
      cta: tl.raw('cta'),
      // testimonials: tl.raw('testimonials'),
    },
  };

  // load page component
  const Page = await getThemePage('dynamic-page');

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-8">
        <Breadcrumbs
          items={[
            { name: tl.raw('breadcrumb.brand'), href: '/' },
            { name: tl.raw('breadcrumb.pages.pricing') },
          ]}
        />
      </div>
      <Page locale={locale} page={page} />
    </>
  );
}
