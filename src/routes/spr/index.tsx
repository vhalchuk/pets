import { createFileRoute } from '@tanstack/react-router';
import { SPRPage } from '@/apps/spr/routes/SPRPage';

export const Route = createFileRoute('/spr/')({
  component: SPRPage,
});
