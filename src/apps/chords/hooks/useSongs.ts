import { useQuery } from '@tanstack/react-query';
import { firestoreApi } from '@/lib/firestore';

// Query keys
export const songKeys = {
  all: ['songs'] as const,
  lists: () => [...songKeys.all, 'list'] as const,
  details: () => [...songKeys.all, 'detail'] as const,
  detail: (id: string) => [...songKeys.details(), id] as const,
};

// Hooks for fetching songs
export function useSongs() {
  return useQuery({
    queryKey: songKeys.lists(),
    queryFn: firestoreApi.getSongs,
  });
}

export function useSong(id: string) {
  return useQuery({
    queryKey: songKeys.detail(id),
    queryFn: () => firestoreApi.getSong(id),
    enabled: !!id, // Only run query if id exists
  });
}
