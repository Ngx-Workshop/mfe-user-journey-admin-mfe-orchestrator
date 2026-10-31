import { TestBed } from '@angular/core/testing';
import { MfeRemoteCatalogActions } from '../../../../../../src/app/features/mfe-remotes/pages/catalog/mfe-remote-catalog-actions';

describe('Shared orchestrator action bar adoption', () => {
  it('retains the live region through save states and forwards shared retry intent once', async () => {
    TestBed.configureTestingModule({
      imports: [MfeRemoteCatalogActions],
    });
    const fixture = TestBed.createComponent(MfeRemoteCatalogActions);
    const retry = jasmine.createSpy('retry');
    fixture.componentInstance.retrySave.subscribe(retry);
    fixture.detectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const live = root.querySelector(
      'ngx-save-feedback [role=status]'
    )!;
    expect(live.getAttribute('aria-live')).toBe('polite');
    for (const [status, text] of [
      ['saving', 'Saving Dashboard…'],
      ['saved', 'Changes saved · Dashboard'],
      ['error', 'Could not save Dashboard.'],
    ]) {
      fixture.componentRef.setInput('saveNotification', {
        status,
        name: 'Dashboard',
      });
      fixture.detectChanges();
      await fixture.whenStable();
      expect(
        root.querySelector('ngx-save-feedback [role=status]')
      ).toBe(live);
      expect(live.textContent?.trim()).toBe(text);
    }
    const button = root.querySelector(
      'ngx-save-feedback button'
    ) as HTMLButtonElement;
    expect(button.type).toBe('button');
    button.click();
    expect(retry).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('saveNotification', null);
    fixture.detectChanges();
    expect(live.textContent?.trim()).toBe('');
    expect(root.querySelector('ngx-save-feedback button')).toBeNull();
  });

  it('preserves count wording, warning tone, actions and configurable sticky offset', async () => {
    TestBed.configureTestingModule({
      imports: [MfeRemoteCatalogActions],
    });
    const fixture = TestBed.createComponent(MfeRemoteCatalogActions);
    const create = jasmine.createSpy('create');
    const back = jasmine.createSpy('back');
    const height = jasmine.createSpy('height');
    fixture.componentInstance.createRemote.subscribe(create);
    fixture.componentInstance.backToList.subscribe(back);
    fixture.componentInstance.heightChange.subscribe(height);
    const root = fixture.nativeElement as HTMLElement;
    root.style.setProperty('--catalog-toolbar-top', '32px');
    fixture.detectChanges();
    await fixture.whenStable();
    const indicator = root.querySelector('ngx-inline-status')!;
    expect(indicator.textContent).toContain('0 MFEs in dev mode');
    expect(indicator.getAttribute('data-tone')).toBe('neutral');
    fixture.componentRef.setInput('devModeCount', 1);
    fixture.detectChanges();
    expect(indicator.textContent).toContain('1 MFE in dev mode');
    expect(indicator.getAttribute('data-tone')).toBe('warning');
    expect(indicator.getAttribute('aria-atomic')).toBe('true');
    (root.querySelector('button') as HTMLButtonElement).click();
    expect(create).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('creating', true);
    fixture.componentRef.setInput('devModeCount', 2);
    fixture.detectChanges();
    expect(indicator.textContent).toContain('2 MFEs in dev mode');
    (root.querySelector('button') as HTMLButtonElement).click();
    expect(back).toHaveBeenCalledTimes(1);
    const bar = root.querySelector('ngx-action-bar') as HTMLElement;
    expect(getComputedStyle(bar).top).toBe('32px');
    expect(height).toHaveBeenCalledWith(
      Math.ceil(bar.getBoundingClientRect().height)
    );
  });
});
