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
  prevToken?: string | null;
  nextToken?: string | null;
  showGhostPreview: boolean;
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
  prevToken,
  nextToken,
  showGhostPreview,
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
      {showGhostPreview && (
        <div className="absolute left-6 top-6 text-sm text-muted-foreground">
          {prevToken || ' '}
        </div>
      )}
      {showGhostPreview && (
        <div className="absolute right-6 top-6 text-sm text-muted-foreground">
          {nextToken || ' '}
        </div>
      )}
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
    </div>
  );
}

export const ReaderStage = memo(ReaderStageComponent);
