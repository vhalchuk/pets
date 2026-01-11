import { createFileRoute } from '@tanstack/react-router';
import { SongListPage } from '@/apps/chords/routes/SongListPage';

export const Route = createFileRoute('/chords/')({
  component: SongListPage,
});
