import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { LayoutMode, OrpMode, ThemePreset } from '../types';
import { getOrpIndex } from '../lib/orp';

const themeClasses: Record<ThemePreset, string> = {
  app: 'bg-background text-foreground',
  light: 'bg-white text-gray-900',
  dark: 'bg-gray-950 text-gray-100',
  sepia: 'bg-amber-50 text-amber-900',
};

const fontFamilyClasses = {
  sans: 'font-sans',
  serif: 'font-serif',
  mono: 'font-mono',
};

interface ReaderStageProps {
  token: string | null;
  contextEnabled: boolean;
  contextBefore: string;
  contextAfter: string;
  orpEnabled: boolean;
  orpMode: OrpMode;
  fontSize: number;
  fontFamily: 'sans' | 'serif' | 'mono';
  lineHeight: number;
  themePreset: ThemePreset;
  layoutMode: LayoutMode;
  countdown: number;
  reducedMotion: boolean;
}

function ReaderStageComponent({
  token,
  contextEnabled,
  contextBefore,
  contextAfter,
  orpEnabled,
  orpMode,
  fontSize,
  fontFamily,
  lineHeight,
  themePreset,
  layoutMode,
  countdown,
  reducedMotion,
}: ReaderStageProps) {
  const stageToken = token ?? '';

  const [prefix, highlight, suffix] = useMemo(() => {
    if (!orpEnabled || !stageToken) return ['', stageToken, ''];
    const index = getOrpIndex(stageToken, orpMode);
    return [
      stageToken.slice(0, index),
      stageToken[index] ?? '',
      stageToken.slice(index + 1),
    ];
  }, [orpEnabled, orpMode, stageToken]);

  const stageHeight = layoutMode === 'focus' ? 'min-h-[40vh]' : 'min-h-[24vh]';
  const contextHeight =
    layoutMode === 'focus'
      ? 'min-h-[4.5rem] max-h-[4.5rem]'
      : 'min-h-[3.5rem] max-h-[3.5rem]';

  return (
    <div
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border',
        themeClasses[themePreset],
        stageHeight,
        reducedMotion ? '' : 'transition-colors duration-200'
      )}
      role="region"
      aria-live="polite"
      aria-label="Reader stage"
    >
      <div className="flex w-full flex-col items-center justify-center gap-6">
        <div
          className={cn(
            'w-full px-6 text-center text-sm text-muted-foreground overflow-hidden',
            contextHeight
          )}
          aria-hidden={!contextEnabled}
        >
          <p className="leading-snug">
            {contextEnabled && contextBefore ? contextBefore : ''}
          </p>
        </div>
        <div
          className={cn(
            'w-full px-6 text-center font-semibold tracking-wide',
            fontFamilyClasses[fontFamily]
          )}
          style={{
            fontSize,
            lineHeight,
          }}
        >
          {countdown > 0 ? (
            <span className="tabular-nums">{countdown}</span>
          ) : stageToken && orpEnabled ? (
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">
              <span className="text-right whitespace-pre">{prefix}</span>
              <span className="text-red-500 whitespace-pre">{highlight}</span>
              <span className="text-left whitespace-pre">{suffix}</span>
            </div>
          ) : stageToken ? (
            <span className="block text-center">{stageToken}</span>
          ) : (
            <span className="text-muted-foreground text-base font-normal">
              Paste or load text to begin
            </span>
          )}
        </div>
        <div
          className={cn(
            'w-full px-6 text-center text-sm text-muted-foreground overflow-hidden',
            contextHeight
          )}
          aria-hidden={!contextEnabled}
        >
          <p className="leading-snug">
            {contextEnabled && contextAfter ? contextAfter : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

export const ReaderStage = memo(ReaderStageComponent);
