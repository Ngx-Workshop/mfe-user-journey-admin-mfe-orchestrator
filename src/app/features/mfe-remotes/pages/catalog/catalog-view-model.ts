import { inject, Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  shareReplay,
} from 'rxjs';
import { MfeRemotesStore } from '../../state/mfe-remotes-store';

/** Route-scoped UI state; catalog persistence belongs to the singleton model. */
@Injectable()
export class CatalogViewModel {
  readonly store = inject(MfeRemotesStore);
  private readonly search = new BehaviorSubject('');
  private readonly selection = new BehaviorSubject<string | null>(
    null
  );

  readonly viewModel$ = combineLatest([
    this.store.state$,
    this.search,
    this.selection,
  ]).pipe(
    map(([{ remotes, pending, error }, searchTerm, selectedId]) => {
      const query = searchTerm.trim().toLowerCase();
      const filtered = remotes.filter((remote) =>
        [
          remote._id,
          remote.name,
          remote.remoteEntryUrl,
          remote.type,
          remote.status,
          remote.archived ? 'archived' : 'active',
          remote.isDevMode ? 'dev mode' : '',
        ].some((value) => value?.toLowerCase().includes(query))
      );
      return {
        filtered,
        searchTerm,
        error,
        busy: pending > 0,
        selected:
          filtered.find((remote) => remote._id === selectedId) ??
          filtered.at(0) ??
          null,
        activeCount: remotes.filter((remote) => !remote.archived)
          .length,
        archivedCount: remotes.filter((remote) => remote.archived)
          .length,
        devModeCount: remotes.filter((remote) => remote.isDevMode)
          .length,
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  select(id: string) {
    this.selection.next(id);
  }
  searchFor(term: string) {
    this.search.next(term);
  }
}
