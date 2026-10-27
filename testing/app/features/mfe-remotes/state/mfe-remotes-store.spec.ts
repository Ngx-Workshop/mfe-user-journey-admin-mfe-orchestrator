import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { firstValueFrom, of, throwError } from 'rxjs';
import { DevModeStorage } from '../../../../../src/app/features/mfe-remotes/api/dev-mode-storage';
import { CatalogViewModel } from '../../../../../src/app/features/mfe-remotes/pages/catalog/catalog-view-model';
import { MfeRemotesStore } from '../../../../../src/app/features/mfe-remotes/state/mfe-remotes-store';

const remote: MfeRemoteDto = {
  _id: 'remote-1',
  name: 'Dashboard',
  description: '',
  type: 'user-journey',
  remoteEntryUrl: 'https://example.com/remoteEntry.js',
  archived: false,
  lastUpdated: '',
  version: 1,
  __v: 0,
  useRoutes: true,
  requiresAuth: false,
  isAdmin: false,
};

describe('MfeRemotesStore and catalog view model', () => {
  let store: MfeRemotesStore;
  let http: HttpTestingController;
  let storage: jasmine.SpyObj<DevModeStorage>;

  beforeEach(() => {
    storage = jasmine.createSpyObj('DevModeStorage', [
      'keys',
      'get',
      'set',
    ]);
    storage.keys.and.returnValue(of(['remote-1']));
    storage.set.and.returnValue(of(undefined));
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CatalogViewModel,
        { provide: DevModeStorage, useValue: storage },
      ],
    });
    store = TestBed.inject(MfeRemotesStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function load(remotes = [remote]) {
    store.load().subscribe();
    http.expectOne('/api/mfe-remotes').flush(remotes);
  }

  it('enriches server data and exposes read-only observable state', async () => {
    load();
    const state = await firstValueFrom(store.state$);
    expect(state.remotes[0].isDevMode).toBeTrue();
    expect(state.pending).toBe(0);
  });

  it('preserves the catalog on refresh failure and recovers on retry', async () => {
    load();
    store.refresh();
    http.expectOne('/api/mfe-remotes').flush('Unavailable', {
      status: 503,
      statusText: 'Unavailable',
    });
    const failed = await firstValueFrom(store.state$);
    expect(failed.remotes.length).toBe(1);
    expect(failed.error).toContain('refreshed');
    expect(failed.pending).toBe(0);
    load();
    expect((await firstValueFrom(store.state$)).error).toBeNull();
  });

  it('loads server data even if the settings broker fails', async () => {
    storage.keys.and.returnValue(
      throwError(() => new Error('broker offline'))
    );
    load();
    const state = await firstValueFrom(store.state$);
    expect(state.remotes.length).toBe(1);
    expect(state.error).toContain('Development settings');
  });

  it('serializes writes and refreshes only after each successful mutation', async () => {
    store.archive(remote);
    store.delete(remote);
    http.expectNone({
      method: 'DELETE',
      url: '/api/mfe-remotes/remote-1',
    });
    http.expectOne('/api/mfe-remotes/remote-1/archive').flush(remote);
    http.expectOne('/api/mfe-remotes').flush([remote]);
    http
      .expectOne({
        method: 'DELETE',
        url: '/api/mfe-remotes/remote-1',
      })
      .flush(null);
    http.expectOne('/api/mfe-remotes').flush([]);
    expect((await firstValueFrom(store.state$)).pending).toBe(0);
  });

  it('keeps the mutation queue alive after a failed write', async () => {
    store.archive(remote);
    http
      .expectOne('/api/mfe-remotes/remote-1/archive')
      .flush('Failed', { status: 500, statusText: 'Failed' });
    expect((await firstValueFrom(store.state$)).error).toContain(
      'change'
    );
    store.archive(remote);
    http.expectOne('/api/mfe-remotes/remote-1/archive').flush(remote);
    http.expectOne('/api/mfe-remotes').flush([remote]);
    expect((await firstValueFrom(store.state$)).pending).toBe(0);
  });

  it('strips server metadata, dev flags and irrelevant type fields from updates', () => {
    store.update({
      ...remote,
      isDevMode: true,
      structuralSubType: 'header',
    });
    const request = http.expectOne('/api/mfe-remotes/remote-1');
    expect(request.request.method).toBe('PATCH');
    for (const key of [
      '_id',
      '__v',
      'version',
      'lastUpdated',
      'isDevMode',
      'structuralSubType',
    ]) {
      expect(Object.keys(request.request.body)).not.toContain(key);
    }
    request.flush(remote);
    http.expectOne('/api/mfe-remotes').flush([remote]);
  });

  it('shows saved only after the PATCH succeeds and clears the notification after three seconds', () => {
    jasmine.clock().install(); jasmine.clock().mockDate();
    let notification!: import('../../../../../src/app/features/mfe-remotes/models/save-notification').SaveNotification;
    const sub = store.saveNotification$.subscribe(value => { notification = value; });
    try {
      store.update({ ...remote, isDevMode: false });
      expect(notification).toEqual({ status: 'saving', name: remote.name });
      jasmine.clock().tick(4000);
      expect(notification).toEqual({ status: 'saving', name: remote.name });
      const patch = http.expectOne('/api/mfe-remotes/remote-1');
      expect(patch.request.body.archived).toBeUndefined();
      patch.flush(remote);
      http.expectOne('/api/mfe-remotes').flush([remote]);
      expect(notification).toEqual({ status: 'saved', name: remote.name });
      jasmine.clock().tick(2999);
      expect(notification).not.toBeNull();
      jasmine.clock().tick(1);
      expect(notification).toBeNull();
    } finally { sub.unsubscribe(); jasmine.clock().uninstall(); }
  });

  it('retains failed saves for retry and never announces a failed PATCH as saved', () => {
    const notifications: unknown[] = [];
    const sub = store.saveNotification$.subscribe(value => notifications.push(value));
    store.update({ ...remote, isDevMode: false, name: 'Edited' });
    http.expectOne('/api/mfe-remotes/remote-1').flush('Failed', { status: 500, statusText: 'Failed' });
    expect(notifications.at(-1)).toEqual({ status: 'error', name: 'Edited' });
    store.retryUpdate();
    const retry = http.expectOne('/api/mfe-remotes/remote-1');
    expect(retry.request.body.name).toBe('Edited');
    retry.flush({ ...remote, name: 'Edited' });
    http.expectOne('/api/mfe-remotes').flush([{ ...remote, name: 'Edited' }]);
    expect(notifications.at(-1)).toEqual({ status: 'saved', name: 'Edited' });
    sub.unsubscribe();
  });

  it('keeps the latest save status while older serialized writes finish', () => {
    const notifications: unknown[] = [];
    const sub = store.saveNotification$.subscribe(value => notifications.push(value));
    store.update({ ...remote, isDevMode: false, name: 'Older' });
    store.update({ ...remote, isDevMode: false, name: 'Newer' });
    http.expectOne('/api/mfe-remotes/remote-1').flush(remote);
    http.expectOne('/api/mfe-remotes').flush([remote]);
    expect(notifications.at(-1)).toEqual({ status: 'saving', name: 'Newer' });
    http.expectOne('/api/mfe-remotes/remote-1').flush({ ...remote, name: 'Newer' });
    http.expectOne('/api/mfe-remotes').flush([{ ...remote, name: 'Newer' }]);
    expect(notifications.at(-1)).toEqual({ status: 'saved', name: 'Newer' });
    sub.unsubscribe();
  });

  it('verifies JavaScript entry responses as text and reports HTTP failures', () => {
    let verified: boolean | undefined;
    store
      .verifyUrl(remote.remoteEntryUrl)
      .subscribe((value) => (verified = value));
    const request = http.expectOne(remote.remoteEntryUrl);
    expect(request.request.responseType).toBe('text');
    request.flush('export const remote = {};');
    expect(verified).toBeTrue();
    store
      .verifyUrl(remote.remoteEntryUrl)
      .subscribe((value) => (verified = value));
    http
      .expectOne(remote.remoteEntryUrl)
      .flush('Not found', { status: 404, statusText: 'Not found' });
    expect(verified).toBeFalse();
  });

  it('updates dev badges immediately after settings persistence', async () => {
    load();
    store.setDevMode(remote._id, null);
    expect(storage.set).toHaveBeenCalledWith(remote._id, null);
    expect(
      (await firstValueFrom(store.state$)).remotes[0].isDevMode
    ).toBeFalse();
  });

  it('searches status and keeps selection coherent as results change', async () => {
    load([
      remote,
      {
        ...remote,
        _id: 'remote-2',
        name: 'Footer',
        type: 'structural',
        archived: true,
      },
    ]);
    const model = TestBed.inject(CatalogViewModel);
    model.select('remote-2');
    expect(
      (await firstValueFrom(model.viewModel$)).selected?._id
    ).toBe('remote-2');
    model.searchFor('  ACTIVE  ');
    const result = await firstValueFrom(model.viewModel$);
    expect(result.filtered.length).toBe(1);
    expect(result.selected?._id).toBe('remote-1');
    expect(result.archivedCount).toBe(1);
    model.searchFor('missing');
    expect(
      (await firstValueFrom(model.viewModel$)).selected
    ).toBeNull();
  });
});
