import { DestroyRef, inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type {
  CreateMfeRemoteDto,
  MfeRemoteDto,
} from '@tmdjr/ngx-mfe-orchestrator-contracts';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  timer,
  defer,
  EMPTY,
  finalize,
  forkJoin,
  map,
  Observable,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { SaveNotification } from '../models/save-notification';
import { MfeRemoteDtoExtraProps } from '../models/app.types';
import { ApiMfeRemotes } from '../api/api-mfe-remotes';
import { DevModeStorage } from '../api/dev-mode-storage';

type CatalogState = {
  remotes: MfeRemoteDtoExtraProps[];
  pending: number;
  loaded: boolean;
  loading: boolean;
  showProgress: boolean;
  error: string | null;
};

/** Singleton model: owns server data, persistence and serialized mutations. */
@Injectable({ providedIn: 'root' })
export class MfeRemotesStore {
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(ApiMfeRemotes);
  private readonly storage = inject(DevModeStorage);
  private readonly state = new BehaviorSubject<CatalogState>({
    remotes: [],
    pending: 0,
    loaded: false,
    loading: false,
    showProgress: false,
    error: null,
  });
  private loadScheduled = false;
  private readonly commands = new Subject<
    () => Observable<unknown>
  >();
  readonly state$ = this.state.asObservable();
  private readonly saveState = new BehaviorSubject<SaveNotification>(
    null
  );
  private saveRevision = 0;
  private failedUpdate: MfeRemoteDtoExtraProps | null = null;
  readonly saveNotification$ = this.saveState.asObservable();

  constructor() {
    this.saveState
      .pipe(
        switchMap((state) =>
          state?.status === 'saved' ? timer(3000) : EMPTY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.saveState.next(null));

    this.commands
      .pipe(
        concatMap((command) =>
          defer(() => {
            this.patch({ error: null });
            return command();
          }).pipe(
            catchError(() => {
              this.patch({
                error:
                  'The change could not be completed. Please try again.',
              });
              return EMPTY;
            }),
            finalize(() =>
              this.patch({ pending: this.state.value.pending - 1 })
            )
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  ensureLoaded(): void {
    if (!this.state.value.loaded) this.refresh();
  }

  private load(showProgress = true) {
    return defer(() => {
      this.patch({
        loading: true,
        showProgress,
        error: null,
      });
      return forkJoin({
        remotes: this.api.fetchMfeRemotes(),
        keys: this.storage.keys().pipe(
          catchError(() => {
            this.patch({
              error: 'Development settings could not be loaded.',
            });
            return of(
              this.state.value.remotes
                .filter((remote) => remote.isDevMode)
                .map((remote) => remote._id)
            );
          })
        ),
      }).pipe(
        map(({ remotes, keys }) =>
          remotes.map((remote) => ({
            ...remote,
            isDevMode: keys.includes(remote._id),
          }))
        ),
        tap((remotes) => this.patch({ remotes, loaded: true })),
        catchError(() => {
          this.patch({
            error:
              'The catalog could not be refreshed. Please try again.',
          });
          return of(this.state.value.remotes);
        }),
        finalize(() =>
          this.patch({ loading: false, showProgress: false })
        )
      );
    });
  }

  refresh(): void {
    if (this.loadScheduled || this.state.value.loading) return;
    this.loadScheduled = true;
    this.enqueue(() =>
      this.load().pipe(
        finalize(() => {
          this.loadScheduled = false;
        })
      )
    );
  }

  create(
    remote: CreateMfeRemoteDto,
    onCreated?: (remote: MfeRemoteDto) => void
  ) {
    this.enqueue(() =>
      this.api.createMfeRemote(remote).pipe(
        switchMap((created) => this.load().pipe(map(() => created))),
        tap((created) => onCreated?.(created))
      )
    );
  }

  update(remote: MfeRemoteDtoExtraProps) {
    const revision = ++this.saveRevision;
    this.failedUpdate = null;
    this.saveState.next({ status: 'saving', name: remote.name });
    const {
      _id,
      lastUpdated,
      archived,
      version,
      isDevMode,
      isAdmin,
      __v,
      ...changes
    } = remote;
    const { structuralSubType, structuralOverrides, ...common } =
      changes;
    const payload =
      changes.type === 'structural'
        ? {
            ...common,
            structuralSubType,
            useRoutes: false,
            requiresAuth: false,
          }
        : { ...common, structuralOverrides };
    this.mutate(
      () =>
        this.api.updateMfeRemote(_id, payload).pipe(
          tap({
            next: () => {
              if (revision === this.saveRevision)
                this.saveState.next({
                  status: 'saved',
                  name: remote.name,
                });
            },
            error: () => {
              if (revision === this.saveRevision) {
                this.failedUpdate = remote;
                this.saveState.next({
                  status: 'error',
                  name: remote.name,
                });
              }
            },
          })
        ),
      false
    );
  }

  retryUpdate() {
    if (this.failedUpdate) this.update(this.failedUpdate);
  }

  archive(remote: MfeRemoteDto) {
    this.mutate(() => this.api.archiveMfeRemote(remote));
  }

  delete(remote: MfeRemoteDto) {
    this.mutate(() => this.api.deleteMfeRemote(remote._id));
  }

  devModeUrl(id: string) {
    return this.storage.get(id);
  }

  setDevMode(id: string, url: string | null) {
    this.enqueue(() =>
      this.storage.set(id, url).pipe(
        tap(() =>
          this.patch({
            remotes: this.state.value.remotes.map((remote) =>
              remote._id === id
                ? { ...remote, isDevMode: !!url }
                : remote
            ),
          })
        )
      )
    );
  }

  verifyUrl(url: string) {
    return this.api.verifyMfeUrl(url).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }

  private mutate(
    request: () => Observable<unknown>,
    showProgress = true
  ) {
    this.enqueue(() =>
      request().pipe(switchMap(() => this.load(showProgress)))
    );
  }

  private enqueue(command: () => Observable<unknown>) {
    this.patch({ pending: this.state.value.pending + 1 });
    this.commands.next(command);
  }

  private patch(changes: Partial<CatalogState>) {
    this.state.next({ ...this.state.value, ...changes });
  }
}
