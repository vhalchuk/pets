import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Pause,
  Play,
  Rewind,
  FastForward,
  RotateCcw,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import type { PlayerStatus } from '../types';

interface ControlsProps {
  status: PlayerStatus;
  canPlay: boolean;
  skipSize: number;
  wpm: number;
  minWpm: number;
  maxWpm: number;
  step: number;
  progress: number;
  total: number;
  showProgressBar: boolean;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onWpmChange: (value: number) => void;
  onSeek: (index: number) => void;
}

export function Controls({
  status,
  canPlay,
  skipSize,
  wpm,
  minWpm,
  maxWpm,
  step,
  progress,
  total,
  showProgressBar,
  onPlay,
  onPause,
  onRestart,
  onPrevious,
  onNext,
  onSkipBack,
  onSkipForward,
  onWpmChange,
  onSeek,
}: ControlsProps) {
  const isPlaying = status === 'playing';
  const isCountdown = status === 'countdown';
  const progressValue = total > 0 ? progress : 0;

  return (
    <div className="space-y-6">
      <TransportControls
        isPlaying={isPlaying}
        isCountdown={isCountdown}
        canPlay={canPlay}
        skipSize={skipSize}
        onPlay={onPlay}
        onPause={onPause}
        onRestart={onRestart}
        onPrevious={onPrevious}
        onNext={onNext}
        onSkipBack={onSkipBack}
        onSkipForward={onSkipForward}
      />

      <SpeedControls
        wpm={wpm}
        minWpm={minWpm}
        maxWpm={maxWpm}
        step={step}
        onWpmChange={onWpmChange}
      />

      {showProgressBar && (
        <ProgressControls
          isPlaying={isPlaying}
          status={status}
          progressValue={progressValue}
          total={total}
          onSeek={onSeek}
        />
      )}
    </div>
  );
}

interface TransportControlsProps {
  isPlaying: boolean;
  isCountdown: boolean;
  canPlay: boolean;
  skipSize: number;
  onPlay: () => void;
  onPause: () => void;
  onRestart: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
}

const TransportControls = memo(function TransportControls({
  isPlaying,
  isCountdown,
  canPlay,
  skipSize,
  onPlay,
  onPause,
  onRestart,
  onPrevious,
  onNext,
  onSkipBack,
  onSkipForward,
}: TransportControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrevious}
        disabled={!canPlay}
        aria-label="Previous word"
        title="Previous word (Shortcut: ←)"
      >
        <SkipBack className="h-4 w-4" />
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSkipBack}
        disabled={!canPlay}
        aria-label={`Skip back ${skipSize} words`}
        title={`Skip back ${skipSize} words (Shortcut: Shift+←)`}
      >
        <Rewind className="h-4 w-4 mr-2" />-{skipSize}
      </Button>
      <Button
        onClick={isPlaying || isCountdown ? onPause : onPlay}
        disabled={!canPlay}
        aria-label={isPlaying || isCountdown ? 'Pause' : 'Play'}
        title={
          isPlaying || isCountdown
            ? 'Pause (Shortcut: Space)'
            : 'Play (Shortcut: Space)'
        }
      >
        {isPlaying || isCountdown ? (
          <>
            <Pause className="h-4 w-4 mr-2" />
            Pause
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2" />
            Play
          </>
        )}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onRestart}
        disabled={!canPlay}
        aria-label="Restart"
        title="Restart (Shortcut: R)"
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Restart
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onSkipForward}
        disabled={!canPlay}
        aria-label={`Skip forward ${skipSize} words`}
        title={`Skip forward ${skipSize} words (Shortcut: Shift+→)`}
      >
        <FastForward className="h-4 w-4 mr-2" />+{skipSize}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={!canPlay}
        aria-label="Next word"
        title="Next word (Shortcut: →)"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  );
});

interface SpeedControlsProps {
  wpm: number;
  minWpm: number;
  maxWpm: number;
  step: number;
  onWpmChange: (value: number) => void;
}

const SpeedControls = memo(function SpeedControls({
  wpm,
  minWpm,
  maxWpm,
  step,
  onWpmChange,
}: SpeedControlsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_220px] lg:items-center">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground" htmlFor="wpm">
          Speed (WPM)
        </label>
        <input
          id="wpm"
          type="range"
          min={minWpm}
          max={maxWpm}
          step={step}
          value={wpm}
          onChange={(event) => onWpmChange(Number(event.target.value))}
          className="w-full"
          aria-label="Words per minute"
        />
      </div>
      <div>
        <label
          className="text-sm font-medium text-foreground"
          htmlFor="wpmInput"
        >
          WPM
        </label>
        <input
          id="wpmInput"
          type="number"
          min={minWpm}
          max={maxWpm}
          step={step}
          value={wpm}
          onChange={(event) => onWpmChange(Number(event.target.value))}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Words per minute input"
        />
      </div>
    </div>
  );
});

interface ProgressControlsProps {
  isPlaying: boolean;
  status: PlayerStatus;
  progressValue: number;
  total: number;
  onSeek: (index: number) => void;
}

const ProgressControls = memo(function ProgressControls({
  isPlaying,
  status,
  progressValue,
  total,
  onSeek,
}: ProgressControlsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{total > 0 ? `${progressValue}/${total}` : '0/0'}</span>
        <span className={cn(isPlaying ? 'text-primary' : '')}>
          {isPlaying ? 'Playing' : status === 'paused' ? 'Paused' : 'Idle'}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={Math.max(0, total - 1)}
        value={Math.max(0, progressValue - 1)}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="w-full"
        aria-label="Seek position"
        disabled={total === 0}
      />
    </div>
  );
});
