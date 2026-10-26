import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
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
      ],
      { state$: state.asObservable() }
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

  it('keeps save disabled for an invalid draft and emits edits with the persisted ID', async () => {
    const name = fixture.nativeElement.querySelector(
      'input[formControlName=name]'
    ) as HTMLInputElement;
    name.value = '';
    name.dispatchEvent(new Event('input'));
    await settle();
    const save = button(fixture.nativeElement, 'Save changes');
    expect(save.disabled).toBeTrue();
    save.click();
    expect(store.update).not.toHaveBeenCalled();
    name.value = 'Updated dashboard';
    name.dispatchEvent(new Event('input'));
    await settle();
    expect(save.disabled).toBeFalse();
    save.click();
    expect(store.update).toHaveBeenCalledWith(
      jasmine.objectContaining({
        _id: 'remote-1',
        name: 'Updated dashboard',
      })
    );
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

  it('requires confirmation before deletion and labels archived status in text', async () => {
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
    const summary = fixture.nativeElement.querySelector(
      'ngx-mfe-remote-summary'
    ) as HTMLElement;
    expect(summary.textContent).toContain('Archived');
    expect(button(fixture.nativeElement, 'Unarchive')).toBeDefined();
  });
});
