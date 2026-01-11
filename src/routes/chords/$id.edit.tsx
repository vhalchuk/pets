import { createFileRoute, useParams } from '@tanstack/react-router';
import { SongEditorPage } from '@/apps/chords/routes/SongEditorPage';

export const Route = createFileRoute('/chords/$id/edit')({
  component: SongEditRoute,
});

function SongEditRoute() {
  const { id } = useParams({ from: '/chords/$id/edit' });
  return <SongEditorPage songId={id} />;
}
