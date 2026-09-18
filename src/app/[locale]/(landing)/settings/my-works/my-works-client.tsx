'use client';

import { useState } from 'react';
import { Download, Loader2, Sparkles } from 'lucide-react';
import { useLocale } from 'next-intl';
import moment from 'moment';

import { LazyImage } from '@/shared/blocks/common';
import { TableCard } from '@/shared/blocks/table';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { cn } from '@/shared/lib/utils';
import { type Tab } from '@/shared/types/blocks/common';
import { type Pagination } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

import { MyWorkDownloadButton, downloadMyWorkImage } from './download-button';

export type MyWorkRow = {
  id: string;
  prompt?: string | null;
  inputImageUrl?: string;
  outputImageUrl?: string;
  outputIsVideo?: boolean;
  model?: string | null;
  costCredits?: number | null;
  createdAt?: string | Date | null;
  statusLabel: string;
  statusClassName: string;
  quality?: string;
  size?: string;
  downloadSuccessMessage: string;
  downloadFailedMessage: string;
};

function DetailImage({
  label,
  imageUrl,
  isVideo,
  className,
  children,
}: {
  label: string;
  imageUrl?: string;
  isVideo?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn('min-w-0 space-y-2', className)}>
      <div className="text-muted-foreground text-sm font-medium">{label}</div>
      <div className="relative flex min-h-[260px] items-center justify-center overflow-hidden bg-white py-2">
        {imageUrl ? (
          isVideo ? (
            <video
              src={imageUrl}
              controls
              playsInline
              className="block max-h-[min(58vh,560px)] w-auto max-w-full"
            />
          ) : (
            <LazyImage
              src={imageUrl}
              alt={label}
              className="block h-auto max-h-[min(58vh,560px)] w-auto max-w-full object-contain"
            />
          )
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
        {children}
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-muted-foreground text-sm font-medium">{label}</div>
      <div className="mt-1 truncate text-base font-semibold">{value || '-'}</div>
    </div>
  );
}

export function MyWorksClient({
  title,
  description,
  tabs,
  rows,
  emptyMessage,
  pagination,
  detailTitle,
  fields,
}: {
  title: string;
  description: string;
  tabs: Tab[];
  rows: MyWorkRow[];
  emptyMessage: string;
  pagination: Pagination;
  detailTitle: string;
  fields: {
    input: string;
    prompt: string;
    output: string;
    model: string;
    quality: string;
    size: string;
    credits: string;
    status: string;
    createdAt: string;
    action: string;
    download: string;
  };
}) {
  const locale = useLocale();
  const [selectedWork, setSelectedWork] = useState<MyWorkRow | null>(null);
  const [downloading, setDownloading] = useState(false);
  const dateLocale = locale === 'zh' ? 'zh-cn' : locale;

  const handleDownload = async () => {
    if (!selectedWork?.outputImageUrl || downloading) {
      return;
    }

    try {
      setDownloading(true);
      await downloadMyWorkImage({
        imageUrl: selectedWork.outputImageUrl,
        fileName: `${selectedWork.id}.png`,
        successMessage: selectedWork.downloadSuccessMessage,
        failedMessage: selectedWork.downloadFailedMessage,
      });
    } finally {
      setDownloading(false);
    }
  };

  const table: Table = {
    columns: [
      {
        title: fields.input,
        className: 'w-[88px]',
        callback: (item: MyWorkRow) => {
          if (!item.inputImageUrl) {
            return <span className="text-slate-400">-</span>;
          }

          return (
            <LazyImage
              src={item.inputImageUrl}
              alt={fields.input}
              width={72}
              height={72}
              style={{ width: '72px', height: '72px' }}
              className="overflow-hidden rounded-md object-cover"
            />
          );
        },
      },
      {
        title: fields.output,
        className: 'w-[88px]',
        callback: (item: MyWorkRow) => {
          if (!item.outputImageUrl) {
            return <span className="text-slate-400">-</span>;
          }

          if (item.outputIsVideo) {
            return (
              <video
                src={item.outputImageUrl}
                muted
                playsInline
                style={{ width: '72px', height: '72px' }}
                className="overflow-hidden rounded-md bg-black object-cover"
              />
            );
          }

          return (
            <LazyImage
              src={item.outputImageUrl}
              alt={fields.output}
              width={72}
              height={72}
              style={{ width: '72px', height: '72px' }}
              className="overflow-hidden rounded-md object-cover"
            />
          );
        },
      },
      {
        name: 'prompt',
        title: fields.prompt,
        className: 'min-w-0 max-w-[180px] sm:max-w-[240px] lg:max-w-[300px]',
        callback: (item: MyWorkRow) => (
          <div className="min-w-0 truncate" title={item.prompt || ''}>
            {item.prompt || '-'}
          </div>
        ),
      },
      {
        name: 'costCredits',
        title: fields.credits,
        className: 'w-[72px]',
        callback: (item: MyWorkRow) => (
          <div className="text-primary font-medium">{item.costCredits}</div>
        ),
      },
      {
        name: 'status',
        title: fields.status,
        className: 'w-[92px]',
        callback: (item: MyWorkRow) => (
          <span className={item.statusClassName}>{item.statusLabel}</span>
        ),
      },
      {
        name: 'createdAt',
        title: fields.createdAt,
        type: 'time',
        className: 'w-[132px]',
      },
      {
        name: 'action',
        title: fields.action,
        className: 'w-[96px]',
        callback: (item: MyWorkRow) => {
          if (!item.outputImageUrl) {
            return <span className="text-slate-400">-</span>;
          }

          return (
            <div onClick={(event) => event.stopPropagation()}>
              <MyWorkDownloadButton
                imageUrl={item.outputImageUrl}
                fileName={`${item.id}.png`}
                title={fields.download}
                successMessage={item.downloadSuccessMessage}
                failedMessage={item.downloadFailedMessage}
              />
            </div>
          );
        },
      },
    ],
    data: rows,
    emptyMessage,
    pagination,
  };

  return (
    <>
      <TableCard
        title={title}
        description={description}
        tabs={tabs}
        table={{
          ...table,
          rowClassName: 'h-16 cursor-pointer',
          onRowClick: setSelectedWork,
        }}
        className="profile-settings-card"
      />

      <Dialog
        open={!!selectedWork}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedWork(null);
          }
        }}
      >
        <DialogContent className="!w-[min(calc(100vw-2rem),1220px)] !max-w-none gap-0 overflow-hidden rounded-2xl p-0">
          {selectedWork ? (
            <>
              <DialogHeader className="border-b px-6 py-4">
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="h-5 w-5 text-primary" />
                  {detailTitle}
                </DialogTitle>
                <DialogDescription className="sr-only">
                  {detailTitle}
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-6 py-5">
                <div className="space-y-6">
                  {selectedWork.inputImageUrl ? (
                    <DetailImage
                      label={fields.input}
                      imageUrl={selectedWork.inputImageUrl}
                    />
                  ) : null}

                  {selectedWork.prompt ? (
                    <div className="min-w-0 space-y-2">
                      <div className="text-muted-foreground text-sm font-medium">
                        {fields.prompt}
                      </div>
                      <div className="rounded-lg border bg-muted/20 p-4 text-base leading-7 whitespace-pre-wrap">
                        {selectedWork.prompt}
                      </div>
                    </div>
                  ) : null}

                  {selectedWork.outputImageUrl ? (
                    <DetailImage
                      label={fields.output}
                      imageUrl={selectedWork.outputImageUrl}
                      isVideo={selectedWork.outputIsVideo}
                    >
                      <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/55 text-white shadow-none hover:bg-black/70"
                          onClick={handleDownload}
                          disabled={downloading}
                        >
                          {downloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                    </DetailImage>
                  ) : null}
                </div>

                <div className="mt-5 grid gap-x-12 gap-y-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-3">
                  <DetailField label={fields.model} value={selectedWork.model} />
                  <DetailField label={fields.quality} value={selectedWork.quality} />
                  <DetailField label={fields.size} value={selectedWork.size} />
                  <DetailField label={fields.credits} value={selectedWork.costCredits} />
                  <DetailField
                    label={fields.status}
                    value={
                      <span className={selectedWork.statusClassName}>
                        {selectedWork.statusLabel}
                      </span>
                    }
                  />
                  <DetailField
                    label={fields.createdAt}
                    value={
                      selectedWork.createdAt
                        ? moment(selectedWork.createdAt)
                            .locale(dateLocale)
                            .format('YYYY/MM/DD HH:mm:ss')
                        : '-'
                    }
                  />
                </div>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
