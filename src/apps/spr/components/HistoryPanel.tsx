import type { SprHistoryItem } from '../types';

interface HistoryPanelProps {
  history: SprHistoryItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
}

function formatTimestamp(value: number) {
  return new Date(value).toLocaleString();
}

export function HistoryPanel({
  history,
  activeId,
  onSelect,
  onClear,
}: HistoryPanelProps) {
  return (
    <div className="space-y-4">
      {history.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No saved texts yet. Start playing to save the current text.
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                item.id === activeId
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-medium text-foreground">
                    {item.title || 'Untitled'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(item.updatedAt)}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {item.wordCount} words
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Last position: {Math.min(item.lastIndex + 1, item.wordCount)}/
                {item.wordCount}
              </div>
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="text-sm text-red-500 hover:underline"
        onClick={onClear}
      >
        Clear history
      </button>
    </div>
  );
}
