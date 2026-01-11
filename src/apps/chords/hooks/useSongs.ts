import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { firestoreApi } from '@/lib/firestore';
import type { Song } from '../types/song';

// Query keys
export const songKeys = {
  all: ['songs'] as const,
  lists: () => [...songKeys.all, 'list'] as const,
  details: () => [...songKeys.all, 'detail'] as const,
  detail: (id: string) => [...songKeys.details(), id] as const,
};

// Hooks for fetching songs
export function useSongs() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: songKeys.lists(),
    queryFn: firestoreApi.getSongs,
  });

  // Populate detail cache for each song when list is fetched
  useEffect(() => {
    if (query.data) {
      query.data.forEach((song: Song) => {
        queryClient.setQueryData(songKeys.detail(song.id), song);
      });
    }
  }, [query.data, queryClient]);

  return query;
}

export function useSong(id: string) {
  return useQuery({
    queryKey: songKeys.detail(id),
    queryFn: () => firestoreApi.getSong(id),
    enabled: !!id, // Only run query if id exists
  });
}
