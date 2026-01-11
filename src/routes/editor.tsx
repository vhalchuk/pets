import React, { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Check, Copy, Trash2, Save } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { parseLyricsWithChords } from '@/lib/chordParser';
import { firestoreApi } from '@/lib/firestore';

export const Route = createFileRoute('/editor')({
  component: Editor,
});

function Editor() {
  const navigate = useNavigate();
  const [songData, setSongData] = useState(() => {
    // Load from localStorage or use default values
    const saved = localStorage.getItem('song-editor-data');
    return saved
      ? JSON.parse(saved)
      : {
          title: '',
          artist: '',
          lyrics: '',
        };
  });
  const [isCopied, setIsCopied] = useState(false);
  const [isCleared, setIsCleared] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleInputChange = (
    field: 'title' | 'artist' | 'lyrics',
    value: string
  ) => {
    setSongData((prev: typeof songData) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Save to localStorage whenever songData changes
  useEffect(() => {
    localStorage.setItem('song-editor-data', JSON.stringify(songData));
  }, [songData]);

  const handleClearAll = () => {
    setSongData({
      title: '',
      artist: '',
      lyrics: '',
    });
    setIsCleared(true);
    setSaveError(null);
    // Reset the cleared state after 2 seconds
    setTimeout(() => setIsCleared(false), 2000);
  };

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(songData, null, 2));
      setIsCopied(true);
      // Reset the copied state after 2 seconds
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  const handleSave = async () => {
    if (!songData.title.trim() || !songData.artist.trim()) {
      setSaveError('Title and Artist are required');
      setTimeout(() => setSaveError(null), 3000);
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      const savedSong = await firestoreApi.createSong({
        title: songData.title.trim(),
        artist: songData.artist.trim(),
        lyrics: songData.lyrics.trim(),
      });

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        navigate({ to: '/songs/$songId', params: { songId: savedSong.id } });
      }, 1000);
    } catch (error) {
      console.error('Failed to save song:', error);
      setSaveError(
        error instanceof Error ? error.message : 'Failed to save song'
      );
      setTimeout(() => setSaveError(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToSongs = () => {
    navigate({ to: '/songs' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-start mb-4">
            <Button onClick={handleBackToSongs} variant="outline">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Back to Songs</span>
            </Button>
          </div>

          {/* Page Title */}
          <h1 className="text-3xl font-bold text-center text-foreground">
            Song Editor
          </h1>
        </div>

        {/* Save Button and Messages */}
        <div className="mb-6 flex items-center justify-center gap-4">
          <Button
            onClick={handleSave}
            disabled={
              isSaving || !songData.title.trim() || !songData.artist.trim()
            }
            variant={saveSuccess ? 'default' : 'default'}
            size="lg"
            className="min-w-32"
          >
            {isSaving ? (
              'Saving...'
            ) : saveSuccess ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save to Firestore
              </>
            )}
          </Button>
          {saveError && <div className="text-red-500 text-sm">{saveError}</div>}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Song Details</CardTitle>
                <Button
                  onClick={handleClearAll}
                  variant={isCleared ? 'default' : 'outline'}
                  size="sm"
                >
                  {isCleared ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  {isCleared ? 'Cleared!' : 'Clear All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={songData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., My Amazing Song"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="artist"
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Artist *
                </label>
                <input
                  id="artist"
                  type="text"
                  value={songData.artist}
                  onChange={(e) => handleInputChange('artist', e.target.value)}
                  placeholder="e.g., John Doe"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label
                  htmlFor="lyrics"
                  className="block text-sm font-medium mb-2 text-foreground"
                >
                  Lyrics (with chords)
                </label>
                <TextareaAutosize
                  id="lyrics"
                  value={songData.lyrics}
                  onChange={(e) => handleInputChange('lyrics', e.target.value)}
                  placeholder="Enter lyrics with chords in square brackets, e.g., [C] Hello world [G] this is a song"
                  minRows={8}
                  maxRows={28}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Use square brackets for chords: [C], [Am], [F], [G], etc.
                </p>
                <p className="text-sm text-muted-foreground">
                  Use "## " for section headers: ## Verse 1, ## Chorus, ##
                  Bridge, etc.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Song Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Song Preview</CardTitle>
                <Button
                  onClick={handleCopyJson}
                  size="sm"
                  variant={isCopied ? 'default' : 'outline'}
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 mr-2" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {isCopied ? 'Copied!' : 'Copy JSON'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {songData.title || songData.artist || songData.lyrics ? (
                <div className="space-y-4">
                  {/* Song Header */}
                  {(songData.title || songData.artist) && (
                    <div className="text-center border-b pb-4">
                      {songData.title && (
                        <h3 className="text-xl font-bold text-foreground mb-2">
                          {songData.title}
                        </h3>
                      )}
                      {songData.artist && (
                        <p className="text-muted-foreground">
                          by {songData.artist}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Song Lyrics Preview */}
                  {songData.lyrics && (
                    <div className="leading-relaxed">
                      {songData.lyrics
                        .split('\n\n')
                        .map((section: string, sectionIndex: number) => (
                          <div key={sectionIndex} className="mb-4">
                            {section
                              .split('\n')
                              .map((line: string, lineIndex: number) => {
                                const parsed = parseLyricsWithChords(line);
                                return (
                                  <React.Fragment key={lineIndex}>
                                    {parsed}
                                  </React.Fragment>
                                );
                              })}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <p>Start typing to see your song preview...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
