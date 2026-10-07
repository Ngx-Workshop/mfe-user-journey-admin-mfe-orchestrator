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
import { MfeRemoteDtoExtraProps } from '../models/app.types';
import { ApiMfeRemotes } from '../api/api-mfe-remotes';
import { DevModeStorage } from '../api/dev-mode-storage';

type CatalogState = {
  remotes: MfeRemoteDtoExtraProps[];
  pending: number;
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
    error: null,
  });
  private readonly commands = new Subject<
    () => Observable<unknown>
  >();
  readonly state$ = this.state.asObservable();

  constructor() {
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

  load() {
    return defer(() => {
      this.patch({
        pending: this.state.value.pending + 1,
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
        tap((remotes) => this.patch({ remotes })),
        catchError(() => {
          this.patch({
            error:
              'The catalog could not be refreshed. Please try again.',
          });
          return of(this.state.value.remotes);
        }),
        finalize(() =>
          this.patch({ pending: this.state.value.pending - 1 })
        )
      );
    });
  }

  refresh() {
    this.enqueue(() => this.load());
  }

  create(remote: CreateMfeRemoteDto) {
    this.mutate(() => this.api.createMfeRemote(remote));
  }

  update({
    _id,
    lastUpdated,
    version,
    isDevMode,
    __v,
    ...changes
  }: MfeRemoteDtoExtraProps) {
    const { structuralSubType, structuralOverrides, ...common } =
      changes;
    const payload =
      changes.type === 'structural'
        ? {
            ...common,
            structuralSubType,
            useRoutes: false,
            requiresAuth: false,
            isAdmin: false,
          }
        : { ...common, structuralOverrides };
    this.mutate(() => this.api.updateMfeRemote(_id, payload));
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

  private mutate(request: () => Observable<unknown>) {
    this.enqueue(() => request().pipe(switchMap(() => this.load())));
  }

  private enqueue(command: () => Observable<unknown>) {
    this.patch({ pending: this.state.value.pending + 1 });
    this.commands.next(command);
  }

  private patch(changes: Partial<CatalogState>) {
    this.state.next({ ...this.state.value, ...changes });
  }
}
