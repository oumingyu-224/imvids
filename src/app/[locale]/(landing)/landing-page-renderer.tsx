import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import {
  type LandingPageConfig,
} from '@/config/landing-pages';
import { PromptShowcase } from '@/shared/blocks/common/prompt-showcase';
import {
  getCurrentSubscription,
  type Subscription,
} from '@/shared/models/subscription';
import { getLatestShowcases } from '@/shared/models/showcase';
import { getUserInfo } from '@/shared/models/user';
import { DynamicPage, Section } from '@/shared/types/blocks/landing';
import { ShowcasesFlowDynamic } from '@/themes/default/blocks/showcases-flow-dynamic';

import { LandingGeneratorToggle } from './landing-generator-toggle';

export async function LandingPageRenderer({
  locale,
  config,
  promptKey,
}: {
  locale: string;
  config: LandingPageConfig;
  promptKey?: string;
}) {
  setRequestLocale(locale);

  const t = await getTranslations(config.namespace);
  const landingT = await getTranslations('landing');

  // 与 settings/billing 页同源：服务端直接查库取当前订阅，供工作台档位判定使用
  let currentSubscription: Subscription | undefined;
  try {
    const user = await getUserInfo();
    if (user) {
      currentSubscription = await getCurrentSubscription(user.id);
    }
  } catch {}

  // Fetch showcases data server-side for faster initial render
  const rawShowcases = config.showSections.includes('showcases-flow')
    ? await getLatestShowcases({
        excludeTags: 'hairstyles',
        sortOrder: 'desc',
        limit: 20,
      })
    : [];

  const initialShowcases = rawShowcases.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  // build page sections
  const page: DynamicPage = {
    sections: config.showSections.reduce<Record<string, Section>>(
      (acc, section) => {
        if (section === 'showcases-flow') {
          const sectionData = (t.raw(section) || landingT.raw(section)) as Section;
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
        } else if (section === 'prompt-showcase') {
          acc[section] = {
            component: (
              <div className="pt-0 pb-0" key="prompt-showcase">
                <PromptShowcase
                  className="mt-12"
                  lockedMode={config.lockedMode}
                  defaultMode={config.defaultMode}
                />
              </div>
            ),
          };
        } else if (section === 'pricing') {
          const pricingT = landingT;
          const { sr_only_title, ...pricing } = pricingT.raw('pricing');
          acc[section] = {
            block: 'pricing',
            data: {
              pricing,
              currentSubscription,
              hidePromo: true,
              hideWhyYearly: true,
              hideCompareTable: true,
            },
          };
        } else {
          const sectionData = (t.raw(section) ||
            landingT.raw(section)) as Section;
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
      },
      {}
    ),
  };

  // load page component
  const Page = await getThemePage('dynamic-page');

  return (
    <LandingGeneratorToggle
      generator={config.workbenchGenerator}
      landing={<Page locale={locale} page={page} />}
      generatorSrOnlyTitle={t.raw('generator.title')}
      promptKey={promptKey}
      modeLocked={config.lockedMode}
      currentSubscription={currentSubscription}
    />
  );
}
