import { useSyncExternalStore } from 'react';
import type { CrudRepo } from './types';

// Subscribes to a repo's full stable snapshot. listSync() (no query) returns the
// same cache reference between mutations (LocalStorageRepo), so it is a safe
// getSnapshot — no new reference per call, no infinite rerender (CLAUDE rule 9).
// Callers derive filtered/sorted views via useMemo over the returned array.
export function useRepoSnapshot<T extends { id: string }, Q>(
  repo: CrudRepo<T, Q>,
): T[] {
  return useSyncExternalStore(repo.subscribe, repo.listSync, repo.listSync);
}
