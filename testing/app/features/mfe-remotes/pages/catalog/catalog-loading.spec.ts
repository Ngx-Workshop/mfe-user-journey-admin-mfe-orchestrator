import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Subject, of } from 'rxjs';
import { Routes } from '../../../../../../src/app/app.routes';
import { MfeRemotesStore } from '../../../../../../src/app/features/mfe-remotes/state/mfe-remotes-store';
import { DevModeStorage } from '../../../../../../src/app/features/mfe-remotes/api/dev-mode-storage';

const remote = {
  _id: 'remote-1',
  name: 'Dashboard',
  type: 'user-journey',
  remoteEntryUrl: 'https://example.com/remoteEntry.js',
};

describe('Nonblocking catalog navigation', () => {
  let http: HttpTestingController;
  let storage: jasmine.SpyObj<DevModeStorage>;

  beforeEach(() => {
    storage = jasmine.createSpyObj('DevModeStorage', ['keys']);
    storage.keys.and.returnValue(of([]));
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          Routes.map((route) => ({ ...route, canActivate: [] }))
        ),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNoopAnimations(),
        { provide: DevModeStorage, useValue: storage },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('finishes navigation while HTTP and broker reads are pending, then updates the current detail', async () => {
    const keys = new Subject<string[]>();
    storage.keys.and.returnValue(keys);
    const harness = await RouterTestingHarness.create(
      '/list-mfe-remotes/remote-1'
    );
    const read = http.expectOne('/api/mfe-remotes');
    expect(
      harness.routeNativeElement
        ?.querySelector('mat-progress-bar')
        ?.getAttribute('aria-label')
    ).toBe('Loading remotes');
    expect(harness.routeNativeElement?.textContent).not.toContain(
      'Remote not found'
    );
    expect(harness.routeNativeElement?.textContent).not.toContain(
      'Your remote catalog is ready'
    );
    await harness.navigateByUrl('/list-mfe-remotes/remote-2');
    await harness.navigateByUrl('/new-mfe-remote');
    expect(
      harness.routeNativeElement?.querySelector('ngx-create-mfe-page')
    ).not.toBeNull();
    await harness.navigateByUrl('/list-mfe-remotes/remote-1');
    http.expectNone('/api/mfe-remotes');
    read.flush([remote]);
    // HTTP completion alone must not misrepresent a pending settings read as empty.
    harness.detectChanges();
    expect(
      harness.routeNativeElement
        ?.querySelector('mat-progress-bar')
        ?.getAttribute('aria-label')
    ).toBe('Loading remotes');
    keys.next([]);
    keys.complete();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(
      harness.routeNativeElement
        ?.querySelector('input[formControlName=name]')
        ?.getAttribute('placeholder')
    ).toBeDefined();
    expect(
      (
        harness.routeNativeElement?.querySelector(
          'input[formControlName=name]'
        ) as HTMLInputElement
      ).value
    ).toBe('Dashboard');
    await harness.navigateByUrl('/list-mfe-remotes');
    await harness.navigateByUrl('/list-mfe-remotes/remote-1');
    http.expectNone('/api/mfe-remotes');
    expect(storage.keys).toHaveBeenCalledTimes(1);
    expect(
      harness.routeNativeElement?.querySelector('mat-progress-bar')
    ).toBeNull();
  });

  it('fills the viewport background below shell chrome while loading and after a failed read', async () => {
    const harness = await RouterTestingHarness.create(
      '/list-mfe-remotes'
    );
    const wrapper = harness.fixture.nativeElement as HTMLElement;
    wrapper.style.cssText =
      'position: absolute; top: 104px; left: 0; width: 100%;';
    const host = harness.routeNativeElement!;
    const measureAfterResize = async () => {
      window.dispatchEvent(new Event('resize'));
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve())
        )
      );
      await harness.fixture.whenStable();
      harness.detectChanges();
    };
    await measureAfterResize();
    expect(host.querySelector('mat-progress-bar')).not.toBeNull();
    expect(
      host.getBoundingClientRect().bottom
    ).toBeGreaterThanOrEqual(window.innerHeight - 1);
    // Resize measurement accounts for a different shell header height as well.
    wrapper.style.top = '168px';
    await measureAfterResize();
    expect(host.getBoundingClientRect().height).toBeCloseTo(
      Math.max(0, window.innerHeight - 168),
      0
    );
    http
      .expectOne('/api/mfe-remotes')
      .flush('Unavailable', {
        status: 503,
        statusText: 'Unavailable',
      });
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(host.querySelector('mat-progress-bar')).toBeNull();
    expect(
      host.getBoundingClientRect().bottom
    ).toBeGreaterThanOrEqual(window.innerHeight - 1);
  });

  it('replaces the default list URL with the first persisted ID after loading and reuses cached data', async () => {
    const location = TestBed.inject(Location);
    const replace = spyOn(location, 'replaceState').and.callThrough();
    const router = TestBed.inject(Router);
    const harness = await RouterTestingHarness.create(
      '/list-mfe-remotes?source=menu#catalog'
    );
    expect(router.url).toBe('/list-mfe-remotes?source=menu#catalog');
    expect(
      harness.routeNativeElement?.querySelector('mat-progress-bar')
    ).not.toBeNull();
    http.expectOne('/api/mfe-remotes').flush([
      { ...remote, _id: '6864b5c8023a0657d6038d55' },
      { ...remote, _id: 'second-remote', name: 'Second remote' },
    ]);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.url).toBe(
      '/list-mfe-remotes/6864b5c8023a0657d6038d55?source=menu#catalog'
    );
    expect(replace.calls.mostRecent().args[0]).toBe(
      '/list-mfe-remotes/6864b5c8023a0657d6038d55?source=menu#catalog'
    );
    http.expectNone('/api/mfe-remotes');
    await harness.navigateByUrl('/new-mfe-remote');
    await harness.navigateByUrl('/list-mfe-remotes');
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(router.url).toBe(
      '/list-mfe-remotes/6864b5c8023a0657d6038d55'
    );
    http.expectNone('/api/mfe-remotes');
    await harness.navigateByUrl('/list-mfe-remotes/second-remote');
    expect(router.url).toBe('/list-mfe-remotes/second-remote');
    await harness.navigateByUrl('/list-mfe-remotes/unknown');
    expect(router.url).toBe('/list-mfe-remotes/unknown');
    expect(harness.routeNativeElement?.textContent).toContain(
      'Remote not found'
    );
  });

  it('opens creation without catalog reads and fetches once when returning to the list', async () => {
    const harness =
      await RouterTestingHarness.create('/new-mfe-remote');
    http.expectNone('/api/mfe-remotes');
    expect(storage.keys).not.toHaveBeenCalled();
    await harness.navigateByUrl('/list-mfe-remotes');
    http.expectOne('/api/mfe-remotes').flush([]);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(
      'Your remote catalog is ready'
    );
    expect(TestBed.inject(Router).url).toBe('/list-mfe-remotes');
    await harness.navigateByUrl('/new-mfe-remote');
    await harness.navigateByUrl('/list-mfe-remotes');
    http.expectNone('/api/mfe-remotes');
  });

  it('uses only the saving indicator for form autosave and its background catalog refresh', async () => {
    const harness = await RouterTestingHarness.create(
      '/list-mfe-remotes/remote-1'
    );
    http.expectOne('/api/mfe-remotes').flush([remote]);
    await harness.fixture.whenStable();
    harness.detectChanges();
    const name = harness.routeNativeElement!.querySelector(
      'input[formControlName=name]'
    ) as HTMLInputElement;
    name.value = 'Edited dashboard';
    name.dispatchEvent(new Event('input'));
    await harness.fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 550));
    harness.detectChanges();
    const patch = http.expectOne('/api/mfe-remotes/remote-1');
    expect(patch.request.method).toBe('PATCH');
    expect(harness.routeNativeElement?.textContent).toContain(
      'Saving Edited dashboard'
    );
    expect(
      harness.routeNativeElement?.querySelector('mat-progress-bar')
    ).toBeNull();
    patch.flush({ ...remote, name: 'Edited dashboard' });
    const refresh = http.expectOne('/api/mfe-remotes');
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(
      'Changes saved'
    );
    expect(
      harness.routeNativeElement?.querySelector('mat-progress-bar')
    ).toBeNull();
    expect(name.value).toBe('Edited dashboard');
    refresh.flush([{ ...remote, name: 'Edited dashboard' }]);
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(
      harness.routeNativeElement?.querySelector('mat-progress-bar')
    ).toBeNull();
    // The next foreground refresh must still show progress.
    TestBed.inject(MfeRemotesStore).refresh();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(
      harness.routeNativeElement?.querySelector('mat-progress-bar')
    ).not.toBeNull();
    http
      .expectOne('/api/mfe-remotes')
      .flush([{ ...remote, name: 'Edited dashboard' }]);
  });

  it('shows a recoverable initial error and store-driven refresh without blocking navigation', async () => {
    const harness = await RouterTestingHarness.create(
      '/list-mfe-remotes/remote-1'
    );
    http
      .expectOne('/api/mfe-remotes')
      .flush('Unavailable', {
        status: 503,
        statusText: 'Unavailable',
      });
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(harness.routeNativeElement?.textContent).toContain(
      'catalog could not be refreshed'
    );
    expect(
      harness.routeNativeElement?.querySelector('mat-progress-bar')
    ).toBeNull();
    expect(harness.routeNativeElement?.textContent).not.toContain(
      'Remote not found'
    );
    const retry = Array.from(
      harness.routeNativeElement!.querySelectorAll('button')
    ).find((button) => button.textContent?.trim() === 'Retry')!;
    retry.click();
    http.expectOne('/api/mfe-remotes').flush([remote]);
    await harness.fixture.whenStable();
    harness.detectChanges();
    const rail = harness.routeNativeElement!.querySelector(
      'ngx-mfe-remote-rail'
    );
    const configuration = harness.routeNativeElement!.querySelector(
      'ngx-mfe-remote > ngx-panel'
    );
    const detailFields = harness.routeNativeElement!.querySelector(
      'ngx-form-section'
    );
    expect(harness.routeNativeElement?.textContent).not.toContain(
      'Refresh catalog'
    );
    TestBed.inject(MfeRemotesStore).refresh();
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(
      harness.routeNativeElement
        ?.querySelector('mat-progress-bar')
        ?.getAttribute('aria-label')
    ).toBe('Refreshing remotes');
    expect(
      harness.routeNativeElement!.querySelector('ngx-mfe-remote-rail')
    ).toBe(rail);
    expect(
      harness.routeNativeElement!.querySelector(
        'ngx-mfe-remote > ngx-panel'
      )
    ).toBe(configuration);
    expect(
      harness.routeNativeElement!.querySelector('ngx-form-section')
    ).toBe(detailFields);
    expect(
      (
        harness.routeNativeElement?.querySelector(
          'input[formControlName=name]'
        ) as HTMLInputElement
      ).value
    ).toBe('Dashboard');
    http
      .expectOne('/api/mfe-remotes')
      .flush('Unavailable', {
        status: 503,
        statusText: 'Unavailable',
      });
    await harness.fixture.whenStable();
    harness.detectChanges();
    expect(
      (
        harness.routeNativeElement?.querySelector(
          'input[formControlName=name]'
        ) as HTMLInputElement
      ).value
    ).toBe('Dashboard');
    expect(
      harness.routeNativeElement?.querySelector('mat-progress-bar')
    ).toBeNull();
    await harness.navigateByUrl('/list-mfe-remotes');
    http.expectNone('/api/mfe-remotes');
  });
});
