import { getTranslations } from 'next-intl/server';

import { AITaskStatus } from '@/extensions/ai';
import { Empty } from '@/shared/blocks/common';
import { getAITasks, getAITasksCount, type AITask } from '@/shared/models/ai_task';
import { getUserInfo } from '@/shared/models/user';
import { type Tab } from '@/shared/types/blocks/common';

import { MyWorksClient } from './my-works-client';

function parseTaskInfo(taskInfo?: string | null) {
  if (!taskInfo) return null;

  try {
    return JSON.parse(taskInfo);
  } catch {
    return null;
  }
}

function parseTaskOptions(options?: string | null) {
  if (!options) return null;

  try {
    return JSON.parse(options);
  } catch {
    return null;
  }
}

function getInputImageUrl(task: AITask) {
  const options = parseTaskOptions(task.options);

  if (Array.isArray(options?.image_input) && options.image_input.length > 0) {
    return options.image_input[0] || '';
  }

  return '';
}

function getTaskOptions(task: AITask) {
  return parseTaskOptions(task.options) || {};
}

function getOutputImageUrl(task: AITask) {
  const taskInfo = parseTaskInfo(task.taskInfo);
  const taskResult = parseTaskInfo(task.taskResult);

  return extractImageUrls(taskInfo)[0] || extractImageUrls(taskResult)[0] || '';
}

function extractImageUrls(result: any): string[] {
  if (!result) {
    return [];
  }

  if (typeof result.resultJson === 'string') {
    const nestedResult = parseTaskInfo(result.resultJson);
    const nestedUrls = extractImageUrls(nestedResult);
    if (nestedUrls.length > 0) {
      return nestedUrls;
    }
  }

  const output =
    result.output ?? result.images ?? result.data ?? result.resultUrls ?? result;

  if (typeof output === 'string') {
    return [output];
  }

  if (Array.isArray(output)) {
    return output
      .flatMap((item) => {
        if (!item) return [];
        if (typeof item === 'string') return [item];
        if (typeof item === 'object') {
          const candidate =
            item.url ??
            item.videoUrl ??
            item.video_url ??
            item.uri ??
            item.image ??
            item.src ??
            item.imageUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object') {
    const candidate =
      output.url ??
      output.videoUrl ??
      output.video_url ??
      output.uri ??
      output.image ??
      output.src ??
      output.imageUrl;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}

function getStatusLabel(status: string, t: Awaited<ReturnType<typeof getTranslations>>) {
  if (status === AITaskStatus.SUCCESS) return t('status.completed');
  if (status === AITaskStatus.PROCESSING || status === AITaskStatus.PENDING) {
    return t('status.processing');
  }
  if (status === AITaskStatus.FAILED) return t('status.failed');
  return status;
}

function getStatusClassName(status: string) {
  if (status === AITaskStatus.SUCCESS) {
    return 'text-emerald-600 dark:text-emerald-400';
  }
  if (status === AITaskStatus.PROCESSING || status === AITaskStatus.PENDING) {
    return 'text-amber-600 dark:text-amber-400';
  }
  if (status === AITaskStatus.FAILED) {
    return 'text-red-600 dark:text-red-400';
  }
  return 'text-muted-foreground';
}

function getImageSize(task: AITask) {
  const options = getTaskOptions(task);
  const taskInfo = parseTaskInfo(task.taskInfo);
  const taskResult = parseTaskInfo(task.taskResult);

  return (
    options.resolution ||
    options.size ||
    taskInfo?.size ||
    taskInfo?.resolution ||
    taskResult?.size ||
    taskResult?.resolution ||
    options.aspect_ratio ||
    '-'
  );
}

function getImageQuality(task: AITask) {
  const options = getTaskOptions(task);
  const taskInfo = parseTaskInfo(task.taskInfo);
  const taskResult = parseTaskInfo(task.taskResult);

  return (
    options.quality_style ||
    options.quality ||
    taskInfo?.quality ||
    taskResult?.quality ||
    '-'
  );
}

function getQualityLabel(
  quality: string,
  t: Awaited<ReturnType<typeof getTranslations>>
) {
  if (quality === 'standard') return t('quality.standard');
  if (quality === 'hd') return t('quality.hd');
  if (quality === 'ultra') return t('quality.ultra');
  return quality;
}

export default async function MyWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: number; pageSize?: number; status?: string }>;
}) {
  const { page: pageNum, pageSize, status } = await searchParams;
  const page = Number(pageNum) || 1;
  const limit = Number(pageSize) || 20;
  const taskStatus =
    !status || status === 'all'
      ? undefined
      : status === 'completed'
        ? AITaskStatus.SUCCESS
        : status === 'processing'
          ? [AITaskStatus.PENDING, AITaskStatus.PROCESSING]
          : status === 'failed'
            ? AITaskStatus.FAILED
            : undefined;

  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const t = await getTranslations('settings.my_works');
  const tasks = await getAITasks({
    userId: user.id,
    status: taskStatus,
    page,
    limit,
  });
  const rows = tasks.map((task) => ({
    ...task,
    inputImageUrl: getInputImageUrl(task),
    outputImageUrl: getOutputImageUrl(task),
    outputIsVideo:
      task.mediaType === 'video' ||
      /\.(mp4|webm|mov|m3u8)(\?.*)?$/i.test(getOutputImageUrl(task)),
    quality: getQualityLabel(getImageQuality(task), t),
    size: getImageSize(task),
    statusLabel: getStatusLabel(task.status, t),
    statusClassName: getStatusClassName(task.status),
    downloadSuccessMessage: t('messages.download_success'),
    downloadFailedMessage: t('messages.download_failed'),
  }));
  const total = await getAITasksCount({
    userId: user.id,
    status: taskStatus,
  });

  const tabs: Tab[] = [
    {
      title: t('list.tabs.all'),
      name: 'all',
      url: '/settings/my-works',
      is_active: !status || status === 'all',
    },
    {
      title: t('list.tabs.completed'),
      name: 'completed',
      url: '/settings/my-works?status=completed',
      is_active: status === 'completed',
    },
    {
      title: t('list.tabs.processing'),
      name: 'processing',
      url: '/settings/my-works?status=processing',
      is_active: status === 'processing',
    },
    {
      title: t('list.tabs.failed'),
      name: 'failed',
      url: '/settings/my-works?status=failed',
      is_active: status === 'failed',
    },
  ];

  return (
    <div className="profile-settings-panel space-y-8">
      <MyWorksClient
        title={t('list.title')}
        description={t('list.description')}
        tabs={tabs}
        rows={rows}
        emptyMessage={t('list.empty')}
        pagination={{
          total,
          page,
          limit,
        }}
        detailTitle={t('detail.title')}
        fields={{
          input: t('fields.input'),
          prompt: t('fields.prompt'),
          output: t('fields.output'),
          model: t('fields.model'),
          quality: t('fields.quality'),
          size: t('fields.size'),
          credits: t('fields.credits'),
          status: t('fields.status'),
          createdAt: t('fields.created_at'),
          action: t('fields.action'),
          download: t('fields.actions.download'),
        }}
      />
    </div>
  );
}
