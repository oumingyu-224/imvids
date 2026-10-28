import { getTranslations, setRequestLocale } from 'next-intl/server';

import { envConfigs } from '@/config';
import { getMetadata } from '@/shared/lib/seo';
import { JsonLd } from '@/shared/blocks/common/json-ld';
import { ShowcasesFlowDynamic } from '@/themes/default/blocks/showcases-flow-dynamic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const generateMetadata = getMetadata({
  metadataKey: 'pages.showcases.metadata',
  canonicalUrl: '/showcases',
});

export default async function ShowcasesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.showcases');
  const showcasesData = t.raw('showcases-flow');

  return (
    <>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: showcasesData.title,
          description: showcasesData.description,
          url: `${envConfigs.app_url}/showcases`,
        }}
      />
      <h1 className="sr-only">{showcasesData.title}</h1>
      <ShowcasesFlowDynamic
        title={showcasesData.title}
        description={showcasesData.description}
        containerClassName="py-14"
      />
    </>
  );
}
