'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { ImageGenerator, VideoGenerator } from '@/shared/blocks/generator';
import {
  type PromptShowcaseConfig,
} from '@/shared/blocks/common/prompt-showcase';

const GENERATE_EVENT = 'prompt-showcase:generate';

export function LandingGeneratorToggle({
  landing,
  generator = 'image',
  generatorSrOnlyTitle,
  promptKey,
}: {
  landing: React.ReactNode;
  generator?: 'image' | 'video';
  generatorSrOnlyTitle?: string;
  promptKey?: string;
}) {
  const [showGenerator, setShowGenerator] = useState(false);
  const [initialConfig, setInitialConfig] = useState<PromptShowcaseConfig | null>(
    null
  );

  useEffect(() => {
    document.body.classList.toggle(
      'generator-workbench-active',
      showGenerator
    );
    return () => document.body.classList.remove('generator-workbench-active');
  }, [showGenerator]);

  useEffect(() => {
    const handler = (event: Event) => {
      const config = (event as CustomEvent<PromptShowcaseConfig>).detail;
      if (!config) return;
      setInitialConfig(config);
      setShowGenerator(true);
      window.scrollTo({ top: 0 });
    };

    window.addEventListener(GENERATE_EVENT, handler);
    return () => window.removeEventListener(GENERATE_EVENT, handler);
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {showGenerator ? (
        <motion.div
          key="generator"
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div className="pt-0">
            {generator === 'video' ? (
              <VideoGenerator srOnlyTitle={generatorSrOnlyTitle} />
            ) : (
              <ImageGenerator
                srOnlyTitle={generatorSrOnlyTitle}
                promptKey={promptKey}
                initialConfig={initialConfig}
              />
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {landing}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
