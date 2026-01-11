import { createFileRoute } from '@tanstack/react-router';
import { SongEditorPage } from '@/apps/chords/routes/SongEditorPage';

export const Route = createFileRoute('/chords/new')({
  component: SongEditorPage,
});
