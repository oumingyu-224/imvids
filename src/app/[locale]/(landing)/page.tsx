import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { ImageGenerator } from '@/shared/blocks/generator';
import { PromptShowcase } from '@/shared/blocks/common/prompt-showcase';
import {
  getCurrentSubscription,
  type Subscription,
} from '@/shared/models/subscription';
import { getLatestShowcases } from '@/shared/models/showcase';
import { getUserInfo } from '@/shared/models/user';
import { DynamicPage, Section } from '@/shared/types/blocks/landing';
import { ShowcasesFlowDynamic } from '@/themes/default/blocks/showcases-flow-dynamic';

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

  const t = await getTranslations('landing');
  const createT = await getTranslations('pages.create');
  const pricingT = await getTranslations('pages.pricing');

  let currentSubscription: Subscription | undefined;
  try {
    const user = await getUserInfo();
    if (user) {
      currentSubscription = await getCurrentSubscription(user.id);
    }
  } catch {}

  // Fetch showcases data server-side for faster initial render
  const rawShowcases = await getLatestShowcases({
    excludeTags: 'hairstyles',
    sortOrder: 'desc',
    limit: 20,
  });

  const initialShowcases = rawShowcases.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  const showSections = [
    'hero',
    // 'generator',
    'showcases-flow',
    'logos',
    'introduce',
    'benefits',
    'usage',
    'features',
    'stats',
    'testimonials',
    'pricing',
    'subscribe',
    'faq',
    'cta',
  ];

  // build page sections
  const page: DynamicPage = {
    sections: showSections.reduce<Record<string, Section>>((acc, section) => {
      if (section === 'showcases-flow') {
        const sectionData = t.raw(section) as Section;
        acc[section] = {
          ...sectionData,
          component: (
            <ShowcasesFlowDynamic
              key="showcases-flow"
              id={sectionData.id}
              title={sectionData.title}
              description={sectionData.description}
              excludeTags="hairstyles"
              sortOrder="desc"
              initialItems={initialShowcases}
            />
          ),
        };
      } else if (section === 'generator') {
        acc[section] = {
          component: (
            <div className="pt-0 pb-12 md:pb-14" key="generator">
              <PromptShowcase className="mt-12" />
              <ImageGenerator
                srOnlyTitle={createT.raw('generator.title')}
                promptKey={promptKey}
              />
            </div>
          ),
        };
      } else if (section === 'pricing') {
        const { sr_only_title, ...pricing } = pricingT.raw('pricing');
        acc[section] = {
          block: 'pricing',
          data: {
            pricing,
            currentSubscription,
          },
        };
      } else {
        const sectionData = t.raw(section) as Section;
        // Skip sections that are explicitly hidden, null, or undefined
        if (
          sectionData &&
          typeof sectionData === 'object' &&
          sectionData.hidden !== true
        ) {
          acc[section] = sectionData;
        }
      }
      return acc;
    }, {}),
  };

  // load page component
  const Page = await getThemePage('dynamic-page');

  return <Page locale={locale} page={page} />;
}
