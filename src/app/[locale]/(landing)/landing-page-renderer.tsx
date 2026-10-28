import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import {
  type LandingPageConfig,
} from '@/config/landing-pages';
import { PromptShowcase } from '@/shared/blocks/common/prompt-showcase';
import { RelatedModels } from '@/shared/blocks/common/related-models';
import { Breadcrumbs } from '@/shared/blocks/common/breadcrumbs';
import { JsonLd } from '@/shared/blocks/common/json-ld';
import { envConfigs } from '@/config';
import { GeneratorErrorBoundary } from '@/shared/blocks/common/generator-error-boundary';
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
          // 展示区防空壳：DB 不足 8 条时回退静态 JSON 条目（内置 10 条）；
          // 静态也不足 8 条则整节不渲染，绝不留 "No items found" 空态
          const staticItems = Array.isArray(
            (sectionData as Record<string, unknown>).items
          )
            ? ((sectionData as Record<string, unknown>).items as Array<{
                title?: string;
                description?: string;
                image?: { src?: string; alt?: string };
              }>)
            : [];
          const displayItems =
            initialShowcases.length >= 8
              ? initialShowcases
              : staticItems
                  .filter((item) => item.image?.src)
                  .map((item, index) => ({
                    id: `static-showcase-${index}`,
                    title: item.title ?? '',
                    description: item.description ?? '',
                    prompt: '',
                    image: item.image?.src ?? '',
                    createdAt: new Date(0).toISOString(),
                  }));

          if (displayItems.length < 8) {
            return acc;
          }

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
                initialItems={displayItems}
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
        } else if (section === 'related-models') {
          // 模型页底部「相关系链接区」：同系列模型页 + 功能页，数据来自 MODEL_PAGES 注册表
          const currentSlug = config.namespace.replace('models.', '');
          acc[section] = {
            component: (
              <RelatedModels
                key="related-models"
                currentSlug={currentSlug}
                title={landingT.raw('related_models_title') || undefined}
                videoLabel={landingT.raw('related_func_video') || undefined}
                imageLabel={landingT.raw('related_func_image') || undefined}
              />
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

  // 模型页 JSON-LD：SoftwareApplication（三档真实价格）+ FAQPage（与页面可见 FAQ 逐字一致）
  const isModelPage = config.namespace.startsWith('models.');
  let modelJsonLd: React.ReactNode = null;
  if (isModelPage) {
    const currentSlug = config.namespace.replace('models.', '');
    const modelName = String(t.raw('generator.title') || currentSlug);
    const description = String(t.raw('metadata.description') || '');
    const faqItems = (t.raw('faq.items') || []) as Array<{
      question?: string;
      answer?: string;
    }>;
    const faqEntities = faqItems
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      }));

    modelJsonLd = (
      <>
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: modelName,
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Web',
            url: `${envConfigs.app_url}/${currentSlug}`,
            description,
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
        {faqEntities.length ? (
          <JsonLd
            data={{
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqEntities,
            }}
          />
        ) : null}
      </>
    );
  }

  // 面包屑（可见 nav>ol + BreadcrumbList JSON-LD 同源）：
  // - 模型页：Oddbeam > 模型 > <模型名>（URL 保持扁平，层级由面包屑表达）
  // - 功能页（ai-video-generator / ai-image-generator）：Oddbeam > <页面名> 两级
  // - 首页不输出面包屑
  const breadcrumbItems = (() => {
    const brand = String(landingT.raw('breadcrumb.brand') || 'Oddbeam');
    if (isModelPage) {
      const currentSlug = config.namespace.replace('models.', '');
      const modelName = String(t.raw('generator.title') || currentSlug);
      return [
        { name: brand, href: '/' },
        { name: String(landingT.raw('breadcrumb.models') || 'Models'), href: '/models' },
        { name: modelName },
      ];
    }
    const canonicalUrl = config.metadata?.canonicalUrl;
    const pageName = canonicalUrl
      ? landingT.raw(`breadcrumb.pages.${canonicalUrl.replace(/^\//, '').replace(/\//g, '.')}`)
      : null;
    if (canonicalUrl && typeof pageName === 'string' && pageName) {
      return [{ name: brand, href: '/' }, { name: pageName }];
    }
    return null;
  })();

  return (
    <>
      {modelJsonLd}
      {breadcrumbItems ? (
        <div className="mx-auto w-full max-w-7xl px-4 pt-6 md:px-8">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      ) : null}
      <GeneratorErrorBoundary>
        <LandingGeneratorToggle
          generator={config.workbenchGenerator}
          landing={<Page locale={locale} page={page} />}
          generatorSrOnlyTitle={t.raw('generator.title')}
          promptKey={promptKey}
          modeLocked={config.lockedMode}
          defaultModel={config.defaultModel}
          currentSubscription={currentSubscription}
        />
      </GeneratorErrorBoundary>
    </>
  );
}
