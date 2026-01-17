import type { SprSettings } from '../types';

interface SettingsPanelProps {
  settings: SprSettings;
  onChange: (updates: Partial<SprSettings>) => void;
  onReset: () => void;
}

export function SettingsPanel({
  settings,
  onChange,
  onReset,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.orpEnabled}
            onChange={(event) => onChange({ orpEnabled: event.target.checked })}
          />
          ORP Highlight
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.showGhostPreview}
            onChange={(event) =>
              onChange({ showGhostPreview: event.target.checked })
            }
          />
          Ghost Preview
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.showProgressBar}
            onChange={(event) =>
              onChange({ showProgressBar: event.target.checked })
            }
          />
          Progress Bar
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.warmupEnabled}
            onChange={(event) =>
              onChange({ warmupEnabled: event.target.checked })
            }
          />
          Warm-up Countdown
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label
            className="text-sm font-medium"
            title="Adjusts the ORP highlight position: short favors earlier letters, long favors later letters."
          >
            ORP Mode
          </label>
          <select
            value={settings.orpMode}
            onChange={(event) =>
              onChange({
                orpMode: event.target.value as SprSettings['orpMode'],
              })
            }
            title="Choose where the red focus letter lands within a word."
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="short">Short word bias</option>
            <option value="medium">Balanced</option>
            <option value="long">Long word bias</option>
          </select>
        </div>
        <div>
          <label
            className="text-sm font-medium"
            title="Compact keeps a smaller stage. Focus uses a wider, taller stage."
          >
            Layout Mode
          </label>
          <select
            value={settings.layoutMode}
            onChange={(event) =>
              onChange({
                layoutMode: event.target.value as SprSettings['layoutMode'],
              })
            }
            title="Choose how large the reader stage appears."
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="compact">Compact</option>
            <option value="focus">Focus</option>
          </select>
        </div>
        <div>
          <label
            className="text-sm font-medium"
            title="App uses the current site theme. Other presets override colors."
          >
            Theme Preset
          </label>
          <select
            value={settings.themePreset}
            onChange={(event) =>
              onChange({
                themePreset: event.target.value as SprSettings['themePreset'],
              })
            }
            title="Pick a fixed color scheme for the reader stage."
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="app">App theme</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="sepia">Sepia</option>
          </select>
        </div>
        <div>
          <label
            className="text-sm font-medium"
            title="Change the typography used in the reader stage."
          >
            Font Family
          </label>
          <select
            value={settings.fontFamily}
            onChange={(event) =>
              onChange({
                fontFamily: event.target.value as SprSettings['fontFamily'],
              })
            }
            title="Select a font style for easier reading."
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          >
            <option value="sans">Sans</option>
            <option value="serif">Serif</option>
            <option value="mono">Mono</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            className="text-sm font-medium"
            title="Controls the size of the word shown in the stage."
          >
            Font Size
          </label>
          <input
            type="number"
            min={18}
            max={96}
            value={settings.fontSize}
            onChange={(event) =>
              onChange({ fontSize: Number(event.target.value) })
            }
            title="Increase for better legibility, decrease for more context."
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label
            className="text-sm font-medium"
            title="Adjusts spacing above and below the word."
          >
            Line Height
          </label>
          <input
            type="number"
            min={1}
            max={2}
            step={0.05}
            value={settings.lineHeight}
            onChange={(event) =>
              onChange({ lineHeight: Number(event.target.value) })
            }
            title="Higher values add breathing room; lower values tighten."
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
        <div>
          <label
            className="text-sm font-medium"
            title="How many words to jump with skip buttons or Shift+Arrow."
          >
            Skip Size
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={settings.skipSize}
            onChange={(event) =>
              onChange({ skipSize: Number(event.target.value) })
            }
            title="Used for skip controls and Shift+Arrow shortcuts."
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.pauseOnPunctuation}
            onChange={(event) =>
              onChange({ pauseOnPunctuation: event.target.checked })
            }
          />
          Pause on punctuation
        </label>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium">Sentence pause</label>
            <input
              type="number"
              min={1}
              max={4}
              step={0.1}
              value={settings.sentencePauseMultiplier}
              onChange={(event) =>
                onChange({
                  sentencePauseMultiplier: Number(event.target.value),
                })
              }
              disabled={!settings.pauseOnPunctuation}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Clause pause</label>
            <input
              type="number"
              min={1}
              max={4}
              step={0.1}
              value={settings.clausePauseMultiplier}
              onChange={(event) =>
                onChange({
                  clausePauseMultiplier: Number(event.target.value),
                })
              }
              disabled={!settings.pauseOnPunctuation}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={settings.pauseOnParagraph}
            onChange={(event) =>
              onChange({ pauseOnParagraph: event.target.checked })
            }
          />
          Pause on paragraph break
        </label>
        <div>
          <label className="text-sm font-medium">Paragraph pause</label>
          <input
            type="number"
            min={1}
            max={4}
            step={0.1}
            value={settings.paragraphPauseMultiplier}
            onChange={(event) =>
              onChange({
                paragraphPauseMultiplier: Number(event.target.value),
              })
            }
            disabled={!settings.pauseOnParagraph}
            className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground disabled:opacity-60"
          />
        </div>
      </div>

      <button
        type="button"
        className="text-sm text-red-500 hover:underline"
        onClick={onReset}
      >
        Reset settings to defaults
      </button>
    </div>
  );
}
