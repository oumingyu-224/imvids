import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getMetadata } from '@/shared/lib/seo';
import { ShowcasesFlowDynamic } from '@/themes/default/blocks/showcases-flow-dynamic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 空壳页（数据为占位内容）：不收录、不进 sitemap、不输出结构化数据
export const generateMetadata = getMetadata({
  metadataKey: 'pages.showcases.metadata',
  canonicalUrl: '/showcases',
  noIndex: true,
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
      <h1 className="sr-only">{showcasesData.title}</h1>
      <ShowcasesFlowDynamic
        title={showcasesData.title}
        description={showcasesData.description}
        containerClassName="py-14"
      />
    </>
  );
}
