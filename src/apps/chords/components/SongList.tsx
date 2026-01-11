import { SongCard } from './SongCard';
import type { Song } from '../types/song';

interface SongListProps {
  songs: Song[];
  onSongSelect?: (song: Song) => void;
}

export function SongList({ songs, onSongSelect }: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No songs available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} onSelect={onSongSelect} />
      ))}
    </div>
  );
}
