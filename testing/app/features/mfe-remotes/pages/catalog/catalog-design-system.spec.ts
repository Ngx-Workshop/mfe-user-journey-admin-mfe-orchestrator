import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
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
  let fixture: ComponentFixture<ListMfeRemotes>;
  let overlay: HTMLElement;
  let state: BehaviorSubject<{
    remotes: MfeRemoteDtoExtraProps[];
    pending: number;
    error: string | null;
  }>;
  let store: jasmine.SpyObj<MfeRemotesStore>;
  let notifications: BehaviorSubject<import('../../../../../../src/app/features/mfe-remotes/models/save-notification').SaveNotification>;

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
    notifications = new BehaviorSubject<import('../../../../../../src/app/features/mfe-remotes/models/save-notification').SaveNotification>(null);
    store = jasmine.createSpyObj(
      'MfeRemotesStore',
      [
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
      { state$: state.asObservable(), saveNotification$: notifications.asObservable() }
    );
    store.verifyUrl.and.returnValue(of(true));
    store.devModeUrl.and.returnValue(of(null));
    await TestBed.configureTestingModule({
      imports: [ListMfeRemotes],
      providers: [
        provideHttpClient(),
        provideNoopAnimations(),
        { provide: MfeRemotesStore, useValue: store },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ListMfeRemotes);
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

  it('distinguishes no search matches from an empty catalog and restores selection', async () => {
    const search = fixture.nativeElement.querySelector(
      'input[type=search]'
    ) as HTMLInputElement;
    search.value = 'does-not-exist';
    search.dispatchEvent(new Event('input'));
    await settle();
    const detail = fixture.nativeElement.querySelector(
      'ngx-mfe-remote-detail'
    ) as HTMLElement;
    expect(detail.textContent).toContain('No matching remote');
    expect(detail.textContent).not.toContain('Create your first');
    button(detail, 'Clear search').click();
    await settle();
    expect(detail.textContent).toContain('Dashboard');
    expect(search.value).toBe('');
    state.next({ remotes: [], pending: 0, error: null });
    await settle();
    expect(detail.textContent).toContain(
      'Your remote catalog is ready'
    );
  });

  it('keeps a long catalog inside the viewport and scrolls its list', async () => {
    state.next({
      remotes: Array.from({ length: 60 }, (_, index) => ({
        ...remote, _id: `remote-${index}`, name: `Remote ${index}`,
      })),
      pending: 0,
      error: null,
    });
    await settle();
    window.dispatchEvent(new Event('resize'));
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    await settle();
    const rail = fixture.nativeElement.querySelector('ngx-mfe-remote-rail') as HTMLElement;
    const list = rail.querySelector('nav') as HTMLElement;
    expect(rail.getBoundingClientRect().bottom).toBeLessThanOrEqual(window.innerHeight);
    expect(list.scrollHeight).toBeGreaterThan(list.clientHeight);
    expect(rail.querySelector('input[type=search]')).not.toBeNull();
  });

  it('puts the selected name, ID and quick actions in one panel header', async () => {
    const detail = fixture.nativeElement.querySelector('ngx-mfe-remote-detail') as HTMLElement;
    const header = detail.querySelector('ngx-mfe-remote > ngx-panel mat-card-header') as HTMLElement;
    expect(header.querySelector('mat-card-title')?.textContent).toContain('Dashboard');
    expect(header.textContent).toContain('ID remote-1');
    expect(header.querySelector('ngx-mfe-remote-card-header')).not.toBeNull();
    expect(header.querySelector('[aria-label="Preview this MFE"]')).not.toBeNull();
    expect(header.querySelector('[aria-label="Configure development mode"]')).not.toBeNull();
    expect(detail.querySelector('.mfe-remote-detail__detail-context')).toBeNull();
    state.next({ remotes: [{ ...remote, name: 'Selected header' }], pending: 0, error: null });
    await settle();
    expect(header.querySelector('mat-card-title')?.getAttribute('aria-label')).toBe('Selected header');
  });

  it('collapses route capabilities without losing edits and themes both accordions', async () => {
    const root = fixture.nativeElement as HTMLElement;
    const capabilities = root.querySelector('ngx-mfe-capabilities') as HTMLElement;
    const header = capabilities.querySelector('mat-expansion-panel-header') as HTMLElement;
    expect(header.getAttribute('aria-expanded')).toBe('false');
    expect(header.textContent).toContain('3/3 enabled');
    header.click();
    await settle();
    expect(header.getAttribute('aria-expanded')).toBe('true');
    const toggle = capabilities.querySelector('[role=switch][aria-label="Uses routes"]') as HTMLElement;
    toggle.click();
    await settle();
    expect(header.textContent).toContain('2/3 enabled');
    header.click();
    await settle();
    header.click();
    await settle();
    expect(toggle.getAttribute('aria-checked')).toBe('false');
    const overridesHeader = root.querySelector('ngx-structural-overrides mat-expansion-panel-header') as HTMLElement;
    overridesHeader.click();
    await settle();
    expect(overridesHeader.getAttribute('aria-expanded')).toBe('true');
    const panels = root.querySelectorAll('ngx-structural-fields mat-expansion-panel');
    expect(panels.length).toBe(2);
    for (const panel of panels) {
      expect(getComputedStyle(panel).borderTopStyle).toBe('solid');
      expect(getComputedStyle(panel).borderRadius).toBe('2px');
    }
    await new Promise<void>(resolve => setTimeout(resolve, 550));
    await settle();
    expect(store.update).toHaveBeenCalledWith(jasmine.objectContaining({ _id: 'remote-1', useRoutes: false }));
  });

  it('saves shell select values and keeps lifecycle archive separate from draft saving', async () => {
    const root = fixture.nativeElement as HTMLElement;
    const overrides = root.querySelector('ngx-structural-overrides') as HTMLElement;
    (overrides.querySelector('mat-expansion-panel-header') as HTMLElement).click();
    await settle();
    expect(overrides.querySelector('mat-radio-group')).toBeNull();
    expect(overrides.querySelectorAll('mat-select').length).toBe(3);
    const selects = await TestbedHarnessEnvironment.loader(fixture).getAllHarnesses(
      MatSelectHarness.with({ ancestor: 'ngx-structural-overrides' })
    );
    for (const [index, choice] of ['Compact', 'Disabled', 'Full'].entries()) {
      await selects[index].open();
      const panelId = await (await selects[index].host()).getAttribute('aria-controls');
      expect(document.getElementById(panelId!)?.classList.contains('ngx-design-system-overlay')).toBeTrue();
      await selects[index].clickOptions({ text: choice });
      await settle();
    }
    await new Promise<void>(resolve => setTimeout(resolve, 550));
    await settle();
    expect(store.update).toHaveBeenCalledWith(jasmine.objectContaining({
      _id: 'remote-1', structuralOverrides: { header: 'compact', nav: 'disabled', footer: 'full' },
    }));
    store.update.calls.reset();
    const lifecycle = root.querySelector('.form-mfe__lifecycle') as HTMLElement;
    (lifecycle.querySelector('mat-expansion-panel-header') as HTMLElement).click();
    await settle();
    button(lifecycle, 'Archive').click();
    expect(store.archive).toHaveBeenCalledWith(jasmine.objectContaining({ _id: 'remote-1' }));
    expect(store.update).not.toHaveBeenCalled();
    state.next({ remotes: [{ ...remote, archived: true }], pending: 0, error: null });
    await settle();
    button(lifecycle, 'Unarchive').click();
    expect(store.archive).toHaveBeenCalledWith(jasmine.objectContaining({ _id: 'remote-1', archived: true }));
  });

  it('autosaves valid edits with the persisted ID and has no manual save button', async () => {
    expect(fixture.nativeElement.textContent).not.toContain('Save changes');
    await new Promise<void>(resolve => setTimeout(resolve, 550));
    expect(store.update).not.toHaveBeenCalled();
    const name = fixture.nativeElement.querySelector('input[formControlName=name]') as HTMLInputElement;
    name.value = '';
    name.dispatchEvent(new Event('input'));
    await settle();
    await new Promise<void>(resolve => setTimeout(resolve, 550));
    expect(store.update).not.toHaveBeenCalled();
    name.value = 'Updated dashboard';
    name.dispatchEvent(new Event('input'));
    await settle();
    await new Promise<void>(resolve => setTimeout(resolve, 550));
    expect(store.update).toHaveBeenCalledOnceWith(jasmine.objectContaining({ _id: 'remote-1', name: 'Updated dashboard' }));
  });

  it('shows save results in the action bar and offers retry after an error', async () => {
    const bar = fixture.nativeElement.querySelector('ngx-mfe-remote-catalog-actions') as HTMLElement;
    notifications.next({ status: 'saving', name: remote.name });
    await settle();
    expect(bar.textContent).toContain('Saving Dashboard');
    notifications.next({ status: 'saved', name: remote.name });
    await settle();
    expect(bar.querySelector('.mfe-remote-catalog-actions__save')?.textContent).toContain('Changes saved');
    notifications.next(null);
    await settle();
    expect(bar.textContent).not.toContain('Changes saved');
    notifications.next({ status: 'error', name: remote.name });
    await settle();
    expect(bar.textContent).toContain('Could not save Dashboard');
    button(bar, 'Retry save').click();
    expect(store.retryUpdate).toHaveBeenCalled();
  });

  it('opens a themed create dialog, validates required fields and preserves type projection', async () => {
    button(fixture.nativeElement, 'New remote').click();
    await settle();
    expect(
      overlay.querySelector('.ngx-design-system-overlay')
    ).not.toBeNull();
    expect(
      overlay.querySelector('.ngx-design-system-backdrop')
    ).not.toBeNull();
    expect(overlay.querySelector('.form-mfe__lifecycle')).toBeNull();
    const create = button(overlay, 'Create');
    expect(create.disabled).toBeTrue();
    const form =
      TestBed.inject(MatDialog).openDialogs[0].componentInstance;
    const content = overlay.querySelector(
      'ngx-create-mfe-dialog'
    ) as HTMLElement;
    for (const [field, value] of [
      ['name', 'New header'],
      ['remoteEntryUrl', 'https://example.com/header.js'],
    ]) {
      const input = content.querySelector(
        `input[formControlName=${field}]`
      ) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event('input'));
    }
    await settle();
    (
      content.querySelector(
        'mat-select[formControlName=type]'
      ) as HTMLElement
    ).click();
    await settle();
    const structural = Array.from(
      overlay.querySelectorAll<HTMLElement>('[role=option]')
    ).find((option) => option.textContent?.trim() === 'Structural');
    expect(structural).toBeDefined();
    structural!.click();
    await settle();
    expect(form.disableCreateButton).toBeFalse();
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
      })
    );
    expect(store.create.calls.mostRecent().args[0]).not.toEqual(
      jasmine.objectContaining({
        structuralOverrides: jasmine.anything(),
      })
    );
  });

  it('requires confirmation before deletion from lifecycle and offers unarchive for archived remotes', async () => {
    const lifecycle = fixture.nativeElement.querySelector('.form-mfe__lifecycle') as HTMLElement;
    const header = lifecycle.querySelector('mat-expansion-panel-header') as HTMLElement;
    expect(header.getAttribute('aria-expanded')).toBe('false');
    header.click();
    await settle();
    expect(header.getAttribute('aria-expanded')).toBe('true');
    expect(lifecycle.querySelector('button')?.type).toBe('button');
    expect(fixture.nativeElement.querySelector('.mfe-remote-card__actions')).toBeNull();
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
});
