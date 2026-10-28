import { DestroyRef, inject, Injectable } from '@angular/core';
import {
  takeUntilDestroyed,
  toSignal,
} from '@angular/core/rxjs-interop';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
} from '@angular/router';
import {
  BehaviorSubject,
  combineLatest,
  filter,
  take,
  map,
  shareReplay,
} from 'rxjs';
import { MfeRemotesStore } from '../../state/mfe-remotes-store';

/** Route-scoped UI state; catalog persistence belongs to the singleton model. */
@Injectable()
export class CatalogViewModel {
  readonly store = inject(MfeRemotesStore);
  private readonly search = new BehaviorSubject('');
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly creating = this.route.snapshot.data['creating'] === true;

  readonly viewModel$ = combineLatest([
    this.store.state$,
    this.search,
    this.route.paramMap,
  ]).pipe(
    map(
      ([
        { remotes, pending, error, loaded, loading, showProgress },
        searchTerm,
        params,
      ]) => {
        const selectedId = params.get('remoteId');
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
          loaded,
          loading,
          showProgress,
          searchTerm,
          error,
          busy: pending > 0,
          missingRemote:
            loaded &&
            !!selectedId &&
            !remotes.some((remote) => remote._id === selectedId),
          selected: selectedId
            ? (remotes.find((remote) => remote._id === selectedId) ??
              null)
            : (filtered.at(0) ?? null),
          activeCount: remotes.filter((remote) => !remote.archived)
            .length,
          archivedCount: remotes.filter((remote) => remote.archived)
            .length,
          devModeCount: remotes.filter((remote) => remote.isDevMode)
            .length,
        };
      }
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly viewModel = toSignal(this.viewModel$, {
    requireSync: true,
  });

  constructor() {
    if (!this.creating) this.store.ensureLoaded();
    // Wait for activation, not for HTTP: the base route remains usable while the
    // catalog loads. Cached data can select the first item immediately afterward.
    combineLatest([
      this.store.state$,
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd)
      ),
    ])
      .pipe(
        filter(
          ([state]) =>
            !this.creating &&
            state.loaded &&
            state.remotes.length > 0 &&
            this.route.snapshot.routeConfig?.path ===
              'list-mfe-remotes'
        ),
        take(1),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe(([state]) => {
        void this.router.navigate(
          ['list-mfe-remotes', state.remotes[0]._id],
          {
            relativeTo: this.route.parent,
            replaceUrl: true,
            queryParamsHandling: 'preserve',
            preserveFragment: true,
          }
        );
      });
  }

  searchFor(term: string) {
    this.search.next(term);
  }
}
