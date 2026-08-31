'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  Aperture,
  AudioLines,
  Banana,
  BarChart3,
  ChevronDown,
  CircleSlash,
  Image as ImageIcon,
  ImagePlus,
  Orbit,
  Sparkles,
  Triangle,
  Video,
} from 'lucide-react';

import { cn } from '@/shared/lib/utils';

import './prompt-showcase.css';

const MODELS = [
  { name: 'Seedance', icon: BarChart3 },
  { name: 'Seedream', icon: AudioLines },
  { name: 'Veo', icon: Sparkles },
  { name: 'Wan', icon: Aperture },
  { name: 'Grok', icon: CircleSlash },
  { name: 'Kling', icon: Orbit },
  { name: 'Nano Banana', icon: Banana },
  { name: 'Flux', icon: Triangle },
];

const IMAGE_MODELS = ['Seedream 5.0 Lite', 'Nano Banana Pro', 'Flux Kontext'];
const VIDEO_MODELS = ['Seedance 2.0', 'Veo 3', 'Kling 2.5'];
const VIDEO_RATIOS = ['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'];
const IMAGE_RATIOS = ['1:1', '4:3', '3:4', '16:9', '9:16', '2:3', '3:2', '21:9'];
const RESOLUTIONS = ['480p', '720p', '1080p'];
const QUALITIES = ['Basic', 'High'];
const IMAGE_COUNTS = [1, 2, 3, 4];

const DEFAULT_PROMPT =
  'A young desert survivor, wearing a hooded desert cloak, runs across golden sand dunes under the intense sunlight.';

type Mode = 'image' | 'video';

function OptionChip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
        active
          ? 'bg-white text-[#15171c]'
          : 'bg-white/[0.07] text-white/70 hover:bg-white/[0.12] hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function PanelLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] font-medium text-white/45">{children}</p>;
}

function SelectDropdown({
  value,
  options,
  icon: Icon,
  onChange,
}: {
  value: string;
  options: string[];
  icon?: typeof BarChart3;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-8 items-center gap-2 rounded-full bg-white/[0.07] px-3.5 text-[13px] font-medium text-white/85 transition-colors hover:bg-white/[0.12]"
      >
        {Icon ? <Icon className="size-4 shrink-0" /> : null}
        <span className="max-w-36 truncate">{value}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-white/50 transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open ? (
        <div className="absolute bottom-full left-0 z-20 mb-2 min-w-full overflow-hidden rounded-2xl border border-white/10 bg-[#14161c] py-1 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
          {options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className={cn(
                'flex w-full items-center whitespace-nowrap px-4 py-2 text-left text-[14px] transition-colors hover:bg-white/[0.08]',
                option === value ? 'text-[#f5d78e]' : 'text-white/80'
              )}
            >
              {option}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PromptShowcase({ className }: { className?: string }) {
  const [value, setValue] = useState(DEFAULT_PROMPT);
  const [activeModel, setActiveModel] = useState('Seedance');
  const [mode, setMode] = useState<Mode>('image');
  const [model, setModel] = useState(IMAGE_MODELS[0]);
  const [videoRatio, setVideoRatio] = useState('16:9');
  const [imageRatio, setImageRatio] = useState('1:1');
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState('480p');
  const [quality, setQuality] = useState('Basic');
  const [imageCount, setImageCount] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [floating, setFloating] = useState(false);
  const [floatingExpanded, setFloatingExpanded] = useState(false);
  const floatingExpandedRef = useRef(false);
  const expanded = hovered || focused || configOpen;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (!floatingExpandedRef.current) {
            setFloating(false);
          }
        } else {
          setFloating(true);
        }
      },
      { threshold: 0, rootMargin: '-160px 0px 0px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const updateFloatingExpanded = (next: boolean) => {
    floatingExpandedRef.current = next;
    setFloatingExpanded(next);
  };

  const collapseFloating = () => {
    floatingExpandedRef.current = false;
    setFloatingExpanded(false);
    setFloating(false);
  };

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setHovered(false);
        setConfigOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleModeChange = (next: Mode) => {
    setMode(next);
    setModel(next === 'image' ? IMAGE_MODELS[0] : VIDEO_MODELS[0]);
  };

  const handleToggleExpanded = () => {
    setHovered(true);
  };

  const currentRatio = mode === 'video' ? videoRatio : imageRatio;
  const summary =
    mode === 'video'
      ? `${videoRatio} | ${duration}s | ${resolution} | ...`
      : `${imageRatio} | ...`;
  const durationPercent = ((duration - 4) / (15 - 4)) * 100;

  const renderPromptBox = (forceExpanded: boolean, isFloating = false) => {
    const boxExpanded = forceExpanded || expanded;
    return (
      <div
        className="prompt-glow-border rounded-[22px]"
        onClick={handleToggleExpanded}
      >
        <div className="relative z-10 rounded-[22px] bg-[#0d0f14]/90 px-5 py-4">
          <div className="flex items-center gap-3">
            <ImagePlus className="size-6 shrink-0 text-white/50" />
            <input
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onFocus={() => {
                setFocused(true);
                if (value === DEFAULT_PROMPT) {
                  setValue('');
                }
                if (!isFloating) {
                  collapseFloating();
                }
              }}
              onBlur={() => setFocused(false)}
              placeholder="Describe your idea..."
              className="min-w-0 flex-1 bg-transparent text-[15px] text-white/85 outline-none placeholder:text-white/40"
            />
            {!boxExpanded ? (
              <button
                type="button"
                className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[linear-gradient(135deg,#f0c46a_0%,#ddb04f_100%)] px-5 text-[15px] font-semibold text-[#2b2410] transition-opacity hover:opacity-90"
              >
                <Sparkles className="size-4" />
                Generate
              </button>
            ) : null}
          </div>

          {boxExpanded ? (
            <div className="prompt-toolbar-in mt-4 flex flex-wrap items-center gap-2">
              <div className="flex h-9 items-center gap-1 rounded-full bg-white/[0.07] p-1">
                <button
                  type="button"
                  onClick={() => handleModeChange('image')}
                  className={cn(
                    'flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors',
                    mode === 'image'
                      ? 'bg-white/[0.15] text-white'
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  <ImageIcon className="size-4" />
                  Image
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('video')}
                  className={cn(
                    'flex h-7 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition-colors',
                    mode === 'video'
                      ? 'bg-white/[0.15] text-white'
                      : 'text-white/60 hover:text-white'
                  )}
                >
                  <Video className="size-4" />
                  Video
                </button>
              </div>
              <SelectDropdown
                value={model}
                options={mode === 'image' ? IMAGE_MODELS : VIDEO_MODELS}
                icon={BarChart3}
                onChange={setModel}
              />

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setConfigOpen((prev) => !prev)}
                  className="flex h-8 items-center gap-2 rounded-full bg-white/[0.07] px-3.5 text-[13px] font-medium text-white/85 transition-colors hover:bg-white/[0.12]"
                >
                  <span className="max-w-52 truncate">{summary}</span>
                  <ChevronDown
                    className={cn(
                      'size-4 shrink-0 text-white/50 transition-transform',
                      configOpen && 'rotate-180'
                    )}
                  />
                </button>

                {configOpen ? (
                  <div className="prompt-toolbar-in absolute bottom-full left-0 z-20 mb-2 w-[380px] max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#14161c] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.45)]">
                    <PanelLabel>Aspect Ratio</PanelLabel>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(mode === 'video' ? VIDEO_RATIOS : IMAGE_RATIOS).map(
                        (option) => (
                          <OptionChip
                            key={option}
                            active={currentRatio === option}
                            onClick={() =>
                              mode === 'video'
                                ? setVideoRatio(option)
                                : setImageRatio(option)
                            }
                          >
                            {option}
                          </OptionChip>
                        )
                      )}
                    </div>

                    {mode === 'video' ? (
                      <>
                        <div className="mt-5 flex items-center justify-between">
                          <PanelLabel>Duration</PanelLabel>
                          <span className="text-[13px] font-semibold text-white">
                            {duration}s
                          </span>
                        </div>
                        <input
                          type="range"
                          min={4}
                          max={15}
                          step={1}
                          value={duration}
                          onChange={(event) =>
                            setDuration(Number(event.target.value))
                          }
                          className="prompt-duration-slider mt-3 w-full"
                          style={{
                            background: `linear-gradient(to right, #f0c46a 0%, #f0c46a ${durationPercent}%, rgba(255,255,255,0.15) ${durationPercent}%, rgba(255,255,255,0.15) 100%)`,
                          }}
                        />
                        <div className="mt-5">
                          <PanelLabel>Resolution</PanelLabel>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {RESOLUTIONS.map((option) => (
                              <OptionChip
                                key={option}
                                active={resolution === option}
                                onClick={() => setResolution(option)}
                              >
                                {option}
                              </OptionChip>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="mt-5">
                          <PanelLabel>Quality</PanelLabel>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {QUALITIES.map((option) => (
                              <OptionChip
                                key={option}
                                active={quality === option}
                                onClick={() => setQuality(option)}
                              >
                                {option}
                              </OptionChip>
                            ))}
                          </div>
                        </div>
                        <div className="mt-5">
                          <PanelLabel>Number of Images</PanelLabel>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {IMAGE_COUNTS.map((option) => (
                              <OptionChip
                                key={option}
                                active={imageCount === option}
                                onClick={() => setImageCount(option)}
                              >
                                {option}
                              </OptionChip>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                className="ml-auto flex h-8 shrink-0 items-center gap-1.5 rounded-full bg-[linear-gradient(135deg,#f0c46a_0%,#ddb04f_100%)] px-4 text-[13px] font-semibold text-[#2b2410] transition-opacity hover:opacity-90"
              >
                <Sparkles className="size-4" />
                Generate
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn('mx-auto w-full max-w-6xl', className)}
    >
      {renderPromptBox(false)}

      <div className="mt-6 flex justify-center">
        <div className="prompt-model-bar mx-auto flex w-full max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-full px-8 py-4">
          {MODELS.map((model) => {
            const active = activeModel === model.name;
            return (
              <button
                key={model.name}
                type="button"
                onClick={() => setActiveModel(model.name)}
                className={cn(
                  'flex items-center gap-2 text-[15px] font-medium transition-colors',
                  active ? 'text-[#f5d78e]' : 'text-white/80 hover:text-white'
                )}
              >
                <model.icon className="size-4" />
                <span>{model.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <motion.button
          type="button"
          onClick={() => updateFloatingExpanded(true)}
          initial={false}
          animate={{
            opacity: floating && !floatingExpanded ? 1 : 0,
            y: floating && !floatingExpanded ? 0 : 32,
            x: '-50%',
            scale: floating && !floatingExpanded ? 1 : 0.85,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`pointer-events-auto absolute bottom-0 left-1/2 flex h-14 w-[380px] max-w-[calc(100vw-2rem)] items-center justify-between rounded-2xl border border-white/10 bg-[#0d0f14]/95 pl-5 pr-2 shadow-[0_16px_40px_rgba(0,0,0,0.45)] ${
            floating && !floatingExpanded ? '' : 'pointer-events-none'
          }`}
        >
          <span className="text-[15px] text-white/50">
            Describe your idea...
          </span>
          <span className="flex size-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,#f0c46a_0%,#ddb04f_100%)]">
            <Sparkles className="size-4 text-[#2b2410]" />
          </span>
        </motion.button>

        <motion.div
          initial={false}
          animate={{
            opacity: floating && floatingExpanded ? 1 : 0,
            y: floating && floatingExpanded ? 0 : 32,
            x: '-50%',
            scale: floating && floatingExpanded ? 0.9 : 0.8,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`absolute bottom-0 left-1/2 w-[896px] max-w-[calc(100vw-2rem)] ${
            floating && floatingExpanded ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {renderPromptBox(true, true)}
        </motion.div>
      </div>
    </div>
  );
}
