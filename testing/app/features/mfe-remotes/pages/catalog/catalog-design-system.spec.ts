import { Clipboard } from '@angular/cdk/clipboard';
import { MatSlideToggleHarness } from '@angular/material/slide-toggle/testing';
import { MatStepperHarness } from '@angular/material/stepper/testing';
import { provideLocationMocks } from '@angular/common/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Location } from '@angular/common';
import { Routes } from '../../../../../../src/app/app.routes';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, Subject, finalize, map, of } from 'rxjs';
import { ListMfeRemotes } from '../../../../../../src/app/features/mfe-remotes/pages/catalog/list-mfe-remotes';
import { MfeRemotesStore } from '../../../../../../src/app/features/mfe-remotes/state/mfe-remotes-store';
import type { MfeRemoteDtoExtraProps } from '../../../../../../src/app/features/mfe-remotes/models/app.types';

const remote: MfeRemoteDtoExtraProps = {
  _id: 'remote-1',
  name: 'Dashboard',
  description: 'Admin overview',
  type: 'user-journey',
  remoteEntryUrl: 'https://example.com/remoteEntry.js',
  archived: false,
  isDevMode: false,
  lastUpdated: '2026-10-26T12:00:00Z',
  version: 1,
  __v: 0,
  useRoutes: true,
  requiresAuth: true,
  isAdmin: true,
};

describe('Design system catalog interactions', () => {
  let fixture: ComponentFixture<unknown>;
  let overlay: HTMLElement;
  let state: BehaviorSubject<{
    remotes: MfeRemoteDtoExtraProps[];
    pending: number;
    error: string | null;
  }>;
  let store: jasmine.SpyObj<MfeRemotesStore>;
  let notifications: BehaviorSubject<
    import('../../../../../../src/app/features/mfe-remotes/models/save-notification').SaveNotification
  >;

  beforeEach(async () => {
    state = new BehaviorSubject({
      remotes: [remote],
      pending: 0,
      error: null,
    } as {
      remotes: MfeRemoteDtoExtraProps[];
      pending: number;
      error: string | null;
    });
    notifications = new BehaviorSubject<
      import('../../../../../../src/app/features/mfe-remotes/models/save-notification').SaveNotification
    >(null);
    store = jasmine.createSpyObj(
      'MfeRemotesStore',
      [
        'ensureLoaded',
        'create',
        'update',
        'archive',
        'delete',
        'refresh',
        'verifyUrl',
        'devModeUrl',
        'setDevMode',
        'retryUpdate',
      ],
      {
        state$: state
          .asObservable()
          .pipe(
            map((value) => ({
              ...value,
              loaded: true,
              loading: false,
            }))
          ),
        saveNotification$: notifications.asObservable(),
      }
    );
    store.verifyUrl.and.returnValue(of(true));
    store.devModeUrl.and.returnValue(of(null));
    await TestBed.configureTestingModule({
      imports: [ListMfeRemotes],
      providers: [
        provideRouter(
          Routes.map((route) => ({ ...route, canActivate: [] }))
        ),
        provideLocationMocks(),
        provideHttpClient(),
        provideNoopAnimations(),
        { provide: MfeRemotesStore, useValue: store },
      ],
    }).compileComponents();
    TestBed.inject(Router).setUpLocationChangeListener();
    const harness = await RouterTestingHarness.create(
      '/list-mfe-remotes'
    );
    fixture = harness.fixture;
    fixture.detectChanges();
    await fixture.whenStable();
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  });

  afterEach(() => {
    TestBed.inject(MatDialog).closeAll();
    fixture.destroy();
    state.complete();
    notifications.complete();
  });

  function button(
    root: HTMLElement,
    text: string
  ): HTMLButtonElement {
    const result = Array.from(root.querySelectorAll('button')).find(
      (b) => b.textContent?.includes(text)
    );
    if (!result) throw Error(`Missing button: ${text}`);
    return result;
  }

  async function settle() {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  function enter(root: HTMLElement, field: string, value: string) {
    const input = root.querySelector(
      `[formControlName=${field}]`
    ) as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  async function completeCreationDetails(
    content: HTMLElement,
    name: string,
    url: string
  ) {
    enter(content, 'remoteEntryUrl', url);
    await settle();
    button(content, 'Verify').click();
    await settle();
    button(content, 'Continue to details').click();
    await settle();
    const continueButton = button(content, 'Continue to integration');
    expect(continueButton.closest('mat-card-actions')).not.toBeNull();
    expect(continueButton.getAttribute('shape')).toBe('chevron');
    expect(continueButton.disabled).toBeTrue();
    enter(content, 'name', name);
    enter(content, 'description', 'A remote description');
    await settle();
    button(content, 'Continue to integration').click();
    await settle();
  }

  it('keeps the routed selection through empty searches and reports removed IDs', async () => {
    const search = fixture.nativeElement.querySelector(
      'input[type=search]'
    ) as HTMLInputElement;
    search.value = 'does-not-exist';
    search.dispatchEvent(new Event('input'));
    await settle();
    const detail = fixture.nativeElement.querySelector(
      'ngx-mfe-remote-detail'
    ) as HTMLElement;
    expect(detail.textContent).toContain('Dashboard');
    const rail = fixture.nativeElement.querySelector(
      'ngx-mfe-remote-rail'
    ) as HTMLElement;
    expect(rail.textContent).toContain('No remotes found');
    button(rail, 'Clear search').click();
    await settle();
    expect(search.value).toBe('');
    state.next({ remotes: [], pending: 0, error: null });
    await settle();
    expect(detail.textContent).toContain('Remote not found');
  });

  it('keeps a long catalog inside the viewport and scrolls its list', async () => {
    state.next({
      remotes: Array.from({ length: 60 }, (_, index) => ({
        ...remote,
        _id: `remote-${index}`,
        name: `Remote ${index}`,
      })),
      pending: 0,
      error: null,
    });
    await settle();
    window.dispatchEvent(new Event('resize'));
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => resolve())
      )
    );
    await settle();
    const rail = fixture.nativeElement.querySelector(
      'ngx-mfe-remote-rail'
    ) as HTMLElement;
    const list = rail.querySelector('nav') as HTMLElement;
    expect(rail.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      window.innerHeight
    );
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
    expect(rail.querySelector('input[type=search]')).not.toBeNull();
  });

  it('keeps the list visible while neighboring configuration panels grow through their intro', async () => {
    spyOnProperty(window, 'innerHeight', 'get').and.returnValue(1200);
    state.next({
      remotes: Array.from({ length: 60 }, (_, index) => ({
        ...remote,
        _id: `remote-${index}`,
        name: `Remote ${index}`,
      })),
      pending: 0,
      error: null,
    });
    await settle();
    const root = fixture.nativeElement as HTMLElement;
    const rail = root.querySelector(
      'ngx-mfe-remote-rail'
    ) as HTMLElement;
    const body = rail.querySelector('aside') as HTMLElement;
    const list = rail.querySelector('nav') as HTMLElement;
    const children = Array.from(
      root.querySelectorAll<HTMLElement>('ngx-form-section')
    );
    (
      root.querySelector('.catalog__layout') as HTMLElement
    ).style.gridTemplateColumns = '340px minmax(0, 1fr)';
    const growths = children.flatMap((child) =>
      child.getAnimations()
    );
    growths.forEach((animation) => animation.pause());
    const listHeights: number[] = [];
    for (const phase of [0, 280, 500, 700, 820, 1000]) {
      growths.forEach((animation) => {
        animation.currentTime = phase;
      });
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() =>
          requestAnimationFrame(() =>
            requestAnimationFrame(() => resolve())
          )
        )
      );
      await settle();
      listHeights.push(list.clientHeight);
      expect(list.clientHeight).toBeGreaterThan(100);
      expect(body.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        window.innerHeight
      );
    }
    expect(
      Math.max(...listHeights) - Math.min(...listHeights)
    ).toBeLessThanOrEqual(2);
    growths.forEach((animation) => animation.finish());
    await settle();
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
  });

  it('puts the selected name, ID and quick actions in one panel header', async () => {
    const detail = fixture.nativeElement.querySelector(
      'ngx-mfe-remote-detail'
    ) as HTMLElement;
    const header = detail.querySelector(
      'ngx-mfe-remote > ngx-panel mat-card-header'
    ) as HTMLElement;
    expect(
      header.querySelector('mat-card-title')?.textContent
    ).toContain('Dashboard');
    expect(header.textContent).toContain('ID remote-1');
    expect(
      header.querySelector('ngx-mfe-remote-card-header')
    ).not.toBeNull();
    expect(
      header.querySelector('[aria-label="Preview this MFE"]')
    ).not.toBeNull();
    expect(
      header.querySelector(
        '[aria-label="Configure development mode"]'
      )
    ).not.toBeNull();
    expect(
      detail.querySelector('.mfe-remote-detail__detail-context')
    ).toBeNull();
    state.next({
      remotes: [{ ...remote, name: 'Selected header' }],
      pending: 0,
      error: null,
    });
    await settle();
    expect(
      header
        .querySelector('mat-card-title')
        ?.getAttribute('aria-label')
    ).toBe('Selected header');
  });

  it('copies the persisted ID and the current URL through labelled buttons, with failure feedback', async () => {
    const copy = spyOn(
      TestBed.inject(Clipboard),
      'copy'
    ).and.returnValue(true);
    const root = fixture.nativeElement as HTMLElement;
    const id = root.querySelector(
      '[aria-label="Copy remote ID"]'
    ) as HTMLElement;
    expect(id.tagName).toBe('SPAN');
    expect(id.getAttribute('role')).toBe('button');
    expect(id.tabIndex).toBe(0);
    id.click();
    await settle();
    expect(copy).toHaveBeenCalledOnceWith('remote-1');
    id.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })
    );
    id.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true })
    );
    expect(copy.calls.count()).toBe(3);
    expect(copy.calls.allArgs()).toEqual([
      ['remote-1'],
      ['remote-1'],
      ['remote-1'],
    ]);
    expect(
      root.querySelector('.mfe-info-group__copy-status')?.textContent
    ).toContain('Remote ID copied');
    const url = root.querySelector(
      'input[formControlName=remoteEntryUrl]'
    ) as HTMLInputElement;
    url.value = 'https://example.com/current-draft.js';
    url.dispatchEvent(new Event('input'));
    await settle();
    const urlCopy = root.querySelector(
      'button[aria-label="Copy remote entry URL"]'
    ) as HTMLButtonElement;
    expect(urlCopy.querySelector('mat-icon')?.textContent).toBe(
      'link'
    );
    expect(urlCopy.type).toBe('button');
    urlCopy.click();
    await settle();
    expect(copy.calls.mostRecent().args[0]).toBe(
      'https://example.com/current-draft.js'
    );
    expect(url.value).toBe('https://example.com/current-draft.js');
    expect(store.verifyUrl).not.toHaveBeenCalled();
    expect(store.update).not.toHaveBeenCalled();
    expect(
      root.querySelector('.mfe-basic-fields__copy-status')
        ?.textContent
    ).toContain('Remote entry URL copied');
    copy.and.returnValue(false);
    urlCopy.click();
    id.click();
    await settle();
    expect(
      root.querySelector('.mfe-basic-fields__copy-status')
        ?.textContent
    ).toContain('Could not copy remote entry URL');
    expect(
      root.querySelector('.mfe-info-group__copy-status')?.textContent
    ).toContain('Could not copy remote ID');
    copy.calls.reset();
    url.value = '';
    url.dispatchEvent(new Event('input'));
    await settle();
    expect(urlCopy.disabled).toBeTrue();
    urlCopy.click();
    expect(copy).not.toHaveBeenCalled();
  });

  it('places development controls on one row and themes enabled overrides and their launcher with warning color', async () => {
    const settings = new Subject<string | null>();
    store.devModeUrl.and.returnValue(settings);
    state.next({
      remotes: [{ ...remote, isDevMode: true }],
      pending: 0,
      error: null,
    });
    await settle();
    const launcher = fixture.nativeElement.querySelector(
      '[aria-label="Configure development mode"]'
    ) as HTMLButtonElement;
    expect(
      launcher.classList.contains(
        'mfe-remote-card-header__dev-mode--active'
      )
    ).toBeTrue();
    expect(getComputedStyle(launcher).boxShadow).not.toBe('none');
    launcher.click();
    await settle();
    const dialog = TestBed.inject(OverlayContainer)
      .getContainerElement()
      .querySelector('ngx-dev-mode-options-dialog') as HTMLElement;
    const toggle = await TestbedHarnessEnvironment.documentRootLoader(
      fixture
    ).getHarness(
      MatSlideToggleHarness.with({
        selector: '.dev-mode-options__toggle',
      })
    );
    const entry = dialog.querySelector('input') as HTMLInputElement;
    expect(await toggle.isDisabled()).toBeTrue();
    expect(entry.disabled).toBeTrue();
    settings.next('http://localhost:4300/remoteEntry.js');
    settings.complete();
    await settle();
    expect(await toggle.isChecked()).toBeTrue();
    expect(await toggle.isDisabled()).toBeFalse();
    expect(entry.value).toBe('http://localhost:4300/remoteEntry.js');
    const row = dialog.querySelector(
      '.dev-mode-options__override-row'
    ) as HTMLElement;
    const toggleElement = row.querySelector(
      'mat-slide-toggle'
    ) as HTMLElement;
    const field = row.querySelector('mat-form-field') as HTMLElement;
    const toggleBounds = toggleElement.getBoundingClientRect();
    const fieldBounds = field.getBoundingClientRect();
    expect(fieldBounds.width).toBeGreaterThan(
      row.getBoundingClientRect().width / 2
    );
    expect(toggleBounds.top + toggleBounds.height / 2).toBeCloseTo(
      fieldBounds.top + fieldBounds.height / 2,
      0
    );
    const warning = getComputedStyle(toggleElement)
      .getPropertyValue('--ngx-color-warning')
      .trim();
    expect(warning).not.toBe('');
    expect(
      getComputedStyle(toggleElement)
        .getPropertyValue('--mat-slide-toggle-selected-track-color')
        .trim()
    ).toBe(warning);
    await toggle.uncheck();
    await settle();
    expect(store.setDevMode).toHaveBeenCalledWith('remote-1', null);
    expect(entry.disabled).toBeTrue();
    await toggle.check();
    await settle();
    expect(store.setDevMode).toHaveBeenCalledWith(
      'remote-1',
      'http://localhost:4201/remoteEntry.js'
    );
    expect(entry.disabled).toBeFalse();
    state.next({ remotes: [remote], pending: 0, error: null });
    await settle();
    expect(
      launcher.classList.contains(
        'mfe-remote-card-header__dev-mode--active'
      )
    ).toBeFalse();
  });

  it('collapses route capabilities without losing edits and themes both accordions', async () => {
    const root = fixture.nativeElement as HTMLElement;
    const capabilities = root.querySelector(
      'ngx-mfe-capabilities'
    ) as HTMLElement;
    const header = capabilities.querySelector(
      'mat-expansion-panel-header'
    ) as HTMLElement;
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(header.textContent).toContain('3/3 enabled');
    header.click();
    await settle();
    expect(header.getAttribute('aria-expanded')).toBe('true');
    const toggle = capabilities.querySelector(
      '[role=switch][aria-label="Uses routes"]'
    ) as HTMLElement;
    toggle.click();
    await settle();
    expect(header.textContent).toContain('2/3 enabled');
    header.click();
    await settle();
    header.click();
    await settle();
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    const overridesHeader = root.querySelector(
      'ngx-structural-overrides mat-expansion-panel-header'
    ) as HTMLElement;
    overridesHeader.click();
    await settle();
    expect(overridesHeader.getAttribute('aria-expanded')).toBe(
      'true'
    );
    const panels = root.querySelectorAll(
      'ngx-structural-fields mat-expansion-panel'
    );
    expect(panels.length).toBe(2);
    for (const panel of panels) {
      expect(getComputedStyle(panel).borderTopStyle).toBe('solid');
      expect(getComputedStyle(panel).borderRadius).toBe('2px');
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 550));
    await settle();
    expect(store.update).toHaveBeenCalledWith(
      jasmine.objectContaining({ _id: 'remote-1', useRoutes: false })
    );
  });

  it('saves shell select values and keeps lifecycle archive separate from draft saving', async () => {
    const root = fixture.nativeElement as HTMLElement;
    const overrides = root.querySelector(
      'ngx-structural-overrides'
    ) as HTMLElement;
    (
      overrides.querySelector(
        'mat-expansion-panel-header'
      ) as HTMLElement
    ).click();
    await settle();
    expect(overrides.querySelector('mat-radio-group')).toBeNull();
    expect(overrides.querySelectorAll('mat-select').length).toBe(3);
    const selects = await TestbedHarnessEnvironment.loader(
      fixture
    ).getAllHarnesses(
      MatSelectHarness.with({ ancestor: 'ngx-structural-overrides' })
    );
    for (const [index, choice] of [
      'Compact',
      'Disabled',
      'Full',
    ].entries()) {
      await selects[index].open();
      const panelId = await (
        await selects[index].host()
      ).getAttribute('aria-controls');
      expect(
        document
          .getElementById(panelId!)
          ?.classList.contains('ngx-design-system-overlay')
      ).toBeTrue();
      await selects[index].clickOptions({ text: choice });
      await settle();
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 550));
    await settle();
    expect(store.update).toHaveBeenCalledWith(
      jasmine.objectContaining({
        _id: 'remote-1',
        structuralOverrides: {
          header: 'compact',
          nav: 'disabled',
          footer: 'full',
        },
      })
    );
    store.update.calls.reset();
    const lifecycle = root.querySelector(
      '.form-mfe__lifecycle'
    ) as HTMLElement;
    (
      lifecycle.querySelector(
        'mat-expansion-panel-header'
      ) as HTMLElement
    ).click();
    await settle();
    button(lifecycle, 'Archive').click();
    expect(store.archive).toHaveBeenCalledWith(
      jasmine.objectContaining({ _id: 'remote-1' })
    );
    expect(store.update).not.toHaveBeenCalled();
    state.next({
      remotes: [{ ...remote, archived: true }],
      pending: 0,
      error: null,
    });
    await settle();
    button(lifecycle, 'Unarchive').click();
    expect(store.archive).toHaveBeenCalledWith(
      jasmine.objectContaining({ _id: 'remote-1', archived: true })
    );
  });

  it('autosaves valid edits with the persisted ID and has no manual save button', async () => {
    expect(fixture.nativeElement.textContent).not.toContain(
      'Save changes'
    );
    await new Promise<void>((resolve) => setTimeout(resolve, 550));
    expect(store.update).not.toHaveBeenCalled();
    const name = fixture.nativeElement.querySelector(
      'input[formControlName=name]'
    ) as HTMLInputElement;
    name.value = '';
    name.dispatchEvent(new Event('input'));
    await settle();
    await new Promise<void>((resolve) => setTimeout(resolve, 550));
    expect(store.update).not.toHaveBeenCalled();
    name.value = 'Updated dashboard';
    name.dispatchEvent(new Event('input'));
    await settle();
    await new Promise<void>((resolve) => setTimeout(resolve, 550));
    expect(store.update).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({
        _id: 'remote-1',
        name: 'Updated dashboard',
      })
    );
  });

  it('shows save results in the action bar and offers retry after an error', async () => {
    const bar = fixture.nativeElement.querySelector(
      'ngx-mfe-remote-catalog-actions'
    ) as HTMLElement;
    notifications.next({ status: 'saving', name: remote.name });
    await settle();
    expect(bar.textContent).toContain('Saving Dashboard');
    notifications.next({ status: 'saved', name: remote.name });
    await settle();
    expect(
      bar.querySelector('.mfe-remote-catalog-actions__save')
        ?.textContent
    ).toContain('Changes saved');
    notifications.next(null);
    await settle();
    expect(bar.textContent).not.toContain('Changes saved');
    notifications.next({ status: 'error', name: remote.name });
    await settle();
    expect(bar.textContent).toContain('Could not save Dashboard');
    button(bar, 'Retry save').click();
    expect(store.retryUpdate).toHaveBeenCalled();
  });

  it('routes to creation, validates required fields and preserves type projection', async () => {
    button(fixture.nativeElement, 'New remote').click();
    await settle();
    expect(TestBed.inject(Router).url).toBe('/new-mfe-remote');
    const content = fixture.nativeElement.querySelector(
      'ngx-create-mfe-page'
    ) as HTMLElement;
    expect(content.querySelector('.form-mfe__lifecycle')).toBeNull();
    expect(content.textContent).not.toContain('Cancel');
    const actions = fixture.nativeElement.querySelector(
      'ngx-mfe-remote-catalog-actions'
    ) as HTMLElement;
    expect(button(actions, 'MFE Remote List')).toBeDefined();
    expect(actions.textContent).not.toContain('New remote');
    expect(
      fixture.nativeElement.querySelector('ngx-mfe-remote-rail')
    ).toBeNull();
    expect(getComputedStyle(content).maxWidth).toBe('765px');
    expect(
      content.querySelector('ngx-panel')?.getAttribute('background')
    ).toBe('glass');
    const continueButton = button(content, 'Continue to details');
    expect(continueButton.getAttribute('shape')).toBe('chevron');
    expect(continueButton.closest('mat-card-actions')).not.toBeNull();
    expect(continueButton.closest('mat-stepper')).toBeNull();
    expect(
      content.querySelector('input[formControlName=name]')
    ).toBeNull();
    expect(content.querySelector('ngx-structural-fields')).toBeNull();
    expect(
      button(content, 'Continue to details').disabled
    ).toBeTrue();
    await completeCreationDetails(
      content,
      'New header',
      'https://example.com/header.js'
    );
    const create = button(content, 'Create');
    expect(create.closest('mat-card-actions')).not.toBeNull();
    expect(create.closest('mat-stepper')).toBeNull();
    expect(create.getAttribute('shape')).toBe('chevron');
    expect(content.querySelector('[matStepperPrevious]')).toBeNull();
    const typeSelect = await TestbedHarnessEnvironment.loader(
      fixture
    ).getHarness(
      MatSelectHarness.with({
        selector: 'mat-select[formControlName=type]',
      })
    );
    await typeSelect.open();
    await typeSelect.clickOptions({ text: 'Structural' });
    await settle();
    expect(create.disabled).toBeFalse();
    expect(store.update).not.toHaveBeenCalled();
    create.click();
    await settle();
    expect(store.create).toHaveBeenCalledWith(
      jasmine.objectContaining({
        name: 'New header',
        type: 'structural',
        structuralSubType: 'header',
        useRoutes: false,
        requiresAuth: false,
        isAdmin: false,
      }),
      jasmine.any(Function)
    );
    expect(store.create.calls.mostRecent().args[0]).not.toEqual(
      jasmine.objectContaining({
        structuralOverrides: jasmine.anything(),
      })
    );
    const callback = store.create.calls.mostRecent().args[1]!;
    callback({ ...remote, _id: 'created-remote' });
    await settle();
    expect(TestBed.inject(Router).url).toBe(
      '/list-mfe-remotes/created-remote'
    );
  });

  it('fills the remaining viewport below a shell header and toolbar without stretching the wizard', async () => {
    const root = fixture.nativeElement as HTMLElement;
    root.style.cssText =
      'position: absolute; top: 104px; left: 0; width: 100%;';
    await TestBed.inject(Router).navigateByUrl('/new-mfe-remote');
    await settle();
    window.dispatchEvent(new Event('resize'));
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() =>
        requestAnimationFrame(() => resolve())
      )
    );
    await settle();
    const layout = root.querySelector(
      '.catalog__layout--creation'
    ) as HTMLElement;
    const wizard = root.querySelector(
      'ngx-create-mfe-page'
    ) as HTMLElement;
    const bounds = layout.getBoundingClientRect();
    expect(bounds.bottom).toBeGreaterThanOrEqual(
      window.innerHeight - 1
    );
    expect(wizard.getBoundingClientRect().width).toBeLessThanOrEqual(
      765
    );
    expect(getComputedStyle(layout).alignItems).toBe('start');
  });

  it('gates URL verification, cancels stale checks and preserves wizard values when moving back', async () => {
    await TestBed.inject(Router).navigateByUrl('/new-mfe-remote');
    await settle();
    const content = fixture.nativeElement.querySelector(
      'ngx-create-mfe-page'
    ) as HTMLElement;
    const stepper =
      await TestbedHarnessEnvironment.loader(fixture).getHarness(
        MatStepperHarness
      );
    const steps = await stepper.getSteps();
    expect(steps.length).toBe(3);
    await steps[2].select();
    expect(await steps[0].isSelected()).toBeTrue();
    enter(content, 'remoteEntryUrl', 'invalid-url');
    await settle();
    expect(button(content, 'Verify').disabled).toBeTrue();
    expect(
      button(content, 'Continue to details').disabled
    ).toBeTrue();
    enter(content, 'remoteEntryUrl', 'https://example.com/first.js');
    await settle();
    const stale = new Subject<boolean>();
    const cancelled = jasmine.createSpy('cancelled');
    store.verifyUrl.and.returnValue(stale.pipe(finalize(cancelled)));
    button(content, 'Verify').click();
    await settle();
    expect(button(content, 'Checking').disabled).toBeTrue();
    expect(
      button(content, 'Continue to details').disabled
    ).toBeTrue();
    enter(content, 'remoteEntryUrl', 'https://example.com/second.js');
    await settle();
    expect(cancelled).toHaveBeenCalled();
    stale.next(true);
    expect(
      button(content, 'Continue to details').disabled
    ).toBeTrue();
    store.verifyUrl.and.returnValue(of(false));
    button(content, 'Verify').click();
    await settle();
    expect(content.textContent).toContain('Verification failed');
    expect(
      button(content, 'Continue to details').disabled
    ).toBeTrue();
    store.verifyUrl.and.returnValue(of(true));
    button(content, 'Verify').click();
    await settle();
    button(content, 'Continue to details').click();
    await settle();
    await steps[2].select();
    expect(await steps[1].isSelected()).toBeTrue();
    enter(content, 'name', 'Wizard draft');
    enter(content, 'description', 'Retained description');
    await settle();
    button(content, 'Continue to integration').click();
    await settle();
    await steps[1].select();
    await settle();
    expect(
      (
        content.querySelector(
          '[formControlName=name]'
        ) as HTMLInputElement
      ).value
    ).toBe('Wizard draft');
    expect(
      (
        content.querySelector(
          '[formControlName=description]'
        ) as HTMLTextAreaElement
      ).value
    ).toBe('Retained description');
    await steps[0].select();
    await settle();
    enter(
      content,
      'remoteEntryUrl',
      'https://example.com/changed.js'
    );
    await settle();
    expect(
      button(content, 'Continue to details').disabled
    ).toBeTrue();
    expect(
      content.querySelector('mat-card-actions')?.textContent
    ).not.toContain('Create');
    expect(
      content.querySelectorAll('mat-card-actions button').length
    ).toBe(1);
    expect(store.create).not.toHaveBeenCalled();
    expect(store.update).not.toHaveBeenCalled();
  });

  it('requires confirmation before deletion from lifecycle and offers unarchive for archived remotes', async () => {
    const lifecycle = fixture.nativeElement.querySelector(
      '.form-mfe__lifecycle'
    ) as HTMLElement;
    const header = lifecycle.querySelector(
      'mat-expansion-panel-header'
    ) as HTMLElement;
    expect(header.getAttribute('aria-expanded')).toBe('false');
    header.click();
    await settle();
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(lifecycle.querySelector('button')?.type).toBe('button');
    expect(
      fixture.nativeElement.querySelector('.mfe-remote-card__actions')
    ).toBeNull();
    button(fixture.nativeElement, 'Delete').click();
    await settle();
    expect(store.delete).not.toHaveBeenCalled();
    button(overlay, 'Delete').click();
    await settle();
    expect(store.delete).toHaveBeenCalledWith(
      jasmine.objectContaining({ _id: 'remote-1' })
    );
    state.next({
      remotes: [{ ...remote, archived: true }],
      pending: 0,
      error: null,
    });
    await settle();
    expect(button(fixture.nativeElement, 'Unarchive')).toBeDefined();
  });
  it('restores ID selection through deep links and browser history, independent of search', async () => {
    state.next({
      remotes: [
        remote,
        { ...remote, _id: 'remote-2', name: 'Second remote' },
      ],
      pending: 0,
      error: null,
    });
    await TestBed.inject(Router).navigateByUrl(
      '/list-mfe-remotes/remote-2'
    );
    await settle();
    expect(
      fixture.nativeElement
        .querySelector('ngx-mfe-remote-detail')
        .querySelector('input[formControlName=name]').value
    ).toBe('Second remote');
    const search = fixture.nativeElement.querySelector(
      'input[type=search]'
    ) as HTMLInputElement;
    search.value = 'no-match';
    search.dispatchEvent(new Event('input'));
    await settle();
    expect(
      fixture.nativeElement
        .querySelector('ngx-mfe-remote-detail')
        .querySelector('input[formControlName=name]').value
    ).toBe('Second remote');
    search.value = '';
    search.dispatchEvent(new Event('input'));
    await settle();
    (
      fixture.nativeElement.querySelector(
        'ngx-mfe-remote-list-item button'
      ) as HTMLButtonElement
    ).click();
    await settle();
    expect(TestBed.inject(Router).url).toBe(
      '/list-mfe-remotes/remote-1'
    );
    TestBed.inject(Location).back();
    await new Promise((resolve) => setTimeout(resolve, 0));
    await settle();
    expect(TestBed.inject(Router).url).toBe(
      '/list-mfe-remotes/remote-2'
    );
    expect(
      fixture.nativeElement
        .querySelector('ngx-mfe-remote-detail')
        .querySelector('input[formControlName=name]').value
    ).toBe('Second remote');
  });

  it('keeps selection, creation and return to list relative to a shell mount', async () => {
    const router = TestBed.inject(Router);
    router.resetConfig([
      {
        path: 'admin/orchestrator',
        children: Routes.map((route) => ({
          ...route,
          canActivate: [],
        })),
      },
    ]);
    await router.navigateByUrl(
      '/admin/orchestrator/list-mfe-remotes/remote-1'
    );
    await settle();
    button(fixture.nativeElement, 'New remote').click();
    await settle();
    expect(router.url).toBe('/admin/orchestrator/new-mfe-remote');
    button(fixture.nativeElement, 'MFE Remote List').click();
    await settle();
    expect(router.url).toBe(
      '/admin/orchestrator/list-mfe-remotes/remote-1'
    );
    expect(button(fixture.nativeElement, 'New remote')).toBeDefined();
  });

  it('shows missing IDs without falling back to another remote', async () => {
    await TestBed.inject(Router).navigateByUrl(
      '/list-mfe-remotes/unknown'
    );
    await settle();
    expect(
      fixture.nativeElement.querySelector('ngx-mfe-remote-detail')
        .textContent
    ).toContain('Remote not found');
    expect(
      fixture.nativeElement.querySelector('ngx-mfe-remote')
    ).toBeNull();
    await TestBed.inject(Router).navigateByUrl(
      '/list-mfe-remotes/remote-1'
    );
    state.next({ remotes: [], pending: 0, error: null });
    await settle();
    expect(
      fixture.nativeElement.querySelector('ngx-mfe-remote-detail')
        .textContent
    ).toContain('Remote not found');
  });

  it('retains a failed creation draft, prevents duplicates while pending and cancels to the catalog', async () => {
    await TestBed.inject(Router).navigateByUrl('/new-mfe-remote');
    await settle();
    const content = fixture.nativeElement.querySelector(
      'ngx-create-mfe-page'
    ) as HTMLElement;
    await completeCreationDetails(
      content,
      'Retained draft',
      'https://example.com/remote.js'
    );
    store.create.and.callFake(() =>
      state.next({ remotes: [remote], pending: 1, error: null })
    );
    button(content, 'Create').click();
    await settle();
    expect(button(content, 'Creating').disabled).toBeTrue();
    state.next({
      remotes: [remote],
      pending: 0,
      error: 'The change could not be completed.',
    });
    await settle();
    expect(
      (
        content.querySelector(
          'input[formControlName=name]'
        ) as HTMLInputElement
      ).value
    ).toBe('Retained draft');
    expect(fixture.nativeElement.textContent).toContain(
      'The change could not be completed.'
    );
    button(content, 'Create').click();
    expect(store.create).toHaveBeenCalledTimes(2);
    button(fixture.nativeElement, 'MFE Remote List').click();
    await settle();
    expect(TestBed.inject(Router).url).toBe(
      '/list-mfe-remotes/remote-1'
    );
    store.create.calls.mostRecent().args[1]!({
      ...remote,
      _id: 'late-result',
    });
    await settle();
    expect(TestBed.inject(Router).url).toBe(
      '/list-mfe-remotes/remote-1'
    );
  });
});
