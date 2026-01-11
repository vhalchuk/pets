import {
  createFileRoute,
  Outlet,
  useParams,
  useLocation,
} from '@tanstack/react-router';
import { SongDetailPage } from '@/apps/chords/routes/SongDetailPage';

export const Route = createFileRoute('/chords/$id')({
  component: SongDetailRoute,
});

function SongDetailRoute() {
  const { id } = useParams({ from: '/chords/$id' });
  const location = useLocation();

  // Check if we're on the edit route
  const isEditRoute = location.pathname.endsWith('/edit');

  // If on edit route, render Outlet for the child route
  if (isEditRoute) {
    return <Outlet />;
  }

  // Otherwise render the detail page
  return <SongDetailPage songId={id} />;
}
