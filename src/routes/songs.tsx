import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { Loader2, Music, Search } from 'lucide-react';
import { SongList } from '@/components/SongList';
import { useSongs } from '@/hooks/useSongs';
import type { Song } from '@/types/song';

export const Route = createFileRoute('/songs')({
  component: SongsPage,
});

function SongsPage() {
  const navigate = useNavigate();
  const { data: songs = [], isLoading, error } = useSongs();

  const handleSongSelect = (song: Song) => {
    navigate({ to: '/songs/$songId', params: { songId: song.id } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="flex items-center justify-center gap-3 mb-4 no-underline"
          >
            <div className="p-3 bg-primary/10 rounded-xl">
              <Music className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Songs</h1>
          </Link>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover and play your favorite songs with chords and lyrics.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search songs..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Songs Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">
            Available Songs {isLoading ? '' : `(${songs.length})`}
          </h2>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">
                Loading songs...
              </span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 mb-2">Failed to load songs</div>
              <div className="text-sm text-muted-foreground">
                {error.message}
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <SongList songs={songs} onSongSelect={handleSongSelect} />
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground mt-12 space-y-4">
          <p>Built with React, TypeScript, Tailwind CSS, and Firebase</p>
        </div>
      </div>
    </div>
  );
}
