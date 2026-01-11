import { createFileRoute, useParams } from '@tanstack/react-router';
import { SongDetailPage } from '@/apps/chords/routes/SongDetailPage';

export const Route = createFileRoute('/chords/$id')({
  component: SongDetailRoute,
});

function SongDetailRoute() {
  const { id } = useParams({ from: '/chords/$id' });
  return <SongDetailPage songId={id} />;
}
