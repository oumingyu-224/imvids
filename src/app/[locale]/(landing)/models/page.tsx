import { getTranslations, setRequestLocale } from 'next-intl/server';

import { Link } from '@/core/i18n/navigation';
import { getMetadata } from '@/shared/lib/seo';
import {
  IMAGE_MODELS,
  VIDEO_MODELS,
  type GeneratorModel,
} from '@/shared/blocks/generator/models';
import { MODEL_PAGES } from '@/config/landing-pages';

export const generateMetadata = getMetadata({
  metadataKey: 'pages.models.metadata',
  canonicalUrl: '/models',
});

/** 工作台模型 id → 模型详情页 slug（仅已建页的 13 个模型） */
const MODEL_ID_TO_SLUG: Record<string, string> = {
  'seedance-2-5': 'seedance-2-5',
  'seedance-2-0': 'seedance-2-0',
  'minimax-h3': 'minimax-h3',
  'veo-3-1-premium': 'veo-3-1',
  'kling-2-5': 'kling-2-5',
  'wan-3-0': 'wan-3-0',
  'gpt-images-2-5-flare': 'gpt-images-2-5',
  'nano-banana-pro': 'nano-banana-pro',
  'nano-banana-2': 'nano-banana-2',
  'seedream-4': 'seedream-4-0',
  'seedream-5-lite': 'seedream-5-lite',
  'flux-kontext-max': 'flux-kontext-max',
  'grok-imagine-image': 'grok-imagine-image',
};

/** 标点按语言区分：中文全角逗号，其余半角 */
function joinComma(locale: string): string {
  return locale === 'zh' ? '，' : ', ';
}

function ModelRows({
  models,
  params,
  creditUnit,
  comingSoonLabel,
  comma,
}: {
  models: GeneratorModel[];
  params: Record<string, string>;
  creditUnit: string;
  comingSoonLabel: string;
  comma: string;
}) {
  return (
    <ul className="landing-panel divide-y rounded-2xl border px-6 py-2">
      {models.map((model) => {
        const slug = MODEL_ID_TO_SLUG[model.id];
        const paramLine = params[model.id];
        const credits = model.pricing?.credits;
        return (
          <li key={model.id} className="py-3">
            <p className="landing-strong text-[15px] font-medium">
              {slug ? (
                <Link
                  href={`/${slug}`}
                  className="hover:underline"
                >
                  {model.name}
                </Link>
              ) : (
                <span className="landing-muted">
                  {model.name}
                  <span className="ml-2 rounded-full border px-2 py-0.5 text-xs font-normal opacity-75">
                    {comingSoonLabel}
                  </span>
                </span>
              )}
              <span className="landing-muted font-normal">
                {' — '}
                {paramLine}
                {typeof credits === 'number'
                  ? `${paramLine ? comma : ''}${credits} ${creditUnit}`
                  : ''}
              </span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export default async function ModelsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('pages.models');
  const params_ = t.raw('params') as Record<string, string>;
  const creditUnit = t.raw('credit_unit') as string;
  const comingSoonLabel = t.raw('coming_soon') as string;
  const comma = joinComma(locale);

  const videoModels = VIDEO_MODELS.filter((m) => !m.hidden);
  const imageModels = IMAGE_MODELS.filter((m) => !m.hidden);

  const groups = [
    { key: 'video', title: t.raw('groups.video'), models: videoModels },
    { key: 'image', title: t.raw('groups.image'), models: imageModels },
  ];

  return (
    <div className="py-12 md:py-16">
      <div className="mx-auto max-w-4xl px-4 md:px-8">
        <header className="mb-10 text-center">
          <h1 className="landing-title text-3xl font-bold tracking-tight md:text-4xl">
            {t.raw('h1')}
          </h1>
          <p className="landing-body mx-auto mt-4 max-w-2xl text-base">
            {t.raw('intro')}
          </p>
        </header>

        <div className="space-y-10">
          {groups.map((group) => (
            <section key={group.key}>
              <h2 className="landing-title mb-4 text-xl font-semibold tracking-tight">
                {group.title}
                <span className="landing-muted ml-2 text-sm font-normal">
                  ({group.models.length})
                </span>
              </h2>
              <ModelRows
                models={group.models}
                params={params_}
                creditUnit={creditUnit}
                comingSoonLabel={comingSoonLabel}
                comma={comma}
              />
            </section>
          ))}

          <section>
            <h2 className="landing-title mb-4 text-xl font-semibold tracking-tight">
              {t.raw('groups.audio')}
            </h2>
            <ul className="landing-panel rounded-2xl border px-6 py-3">
              <li>
                <p className="landing-strong text-[15px] font-medium">
                  <Link href="/ai-music-generator" className="hover:underline">
                    {t.raw('audio_entry.name')}
                  </Link>
                  <span className="landing-muted font-normal">
                    {' — '}
                    {t.raw('audio_entry.description')}
                  </span>
                </p>
              </li>
            </ul>
          </section>
        </div>

        <section className="mt-12">
          <h2 className="landing-title mb-3 text-xl font-semibold tracking-tight">
            {t.raw('guide_title')}
          </h2>
          <p className="landing-body text-base">{t.raw('guide')}</p>
        </section>

        <div className="mt-12 text-center">
          <Link
            href="/create"
            className="landing-strong inline-flex h-11 items-center rounded-full border px-6 text-sm font-semibold landing-input-surface transition-colors"
          >
            {t.raw('cta_button')}
          </Link>
          <p className="landing-muted mt-3 text-sm">{t.raw('cta_text')}</p>
        </div>
      </div>
    </div>
  );
}
