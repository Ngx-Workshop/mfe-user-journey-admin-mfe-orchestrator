import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MatSelect } from '@angular/material/select';
import { StructuralSubTypeOptions } from '../../../../../../../src/app/features/mfe-remotes/components/remote-configuration/form-mfe/form-mfe-structural-subtypes';
import { FormControl } from '@angular/forms';

describe('Structural placement select closing animation', () => {
  let fixture: ComponentFixture<StructuralSubTypeOptions>;
  let select: MatSelect;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StructuralSubTypeOptions],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    fixture = TestBed.createComponent(StructuralSubTypeOptions);
    fixture.componentRef.setInput('structuralSubTypeControl', new FormControl('header', { nonNullable: true }));
    fixture.detectChanges();
    await fixture.whenStable();
    select = fixture.debugElement.query(By.directive(MatSelect)).componentInstance;
  });

  for (const dismissal of ['outside click', 'selection', 'Escape']) {
    it(`stays transparent after fading out on ${dismissal}, then detaches and reopens`, async () => {
      select.open();
      fixture.detectChanges();
      await fixture.whenStable();
      const panel = select.panel.nativeElement as HTMLElement;
      for (const animation of panel.getAnimations()) animation.finish();
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      if (dismissal === 'outside click') {
        document.querySelector<HTMLElement>('.cdk-overlay-backdrop')!.click();
      } else if (dismissal === 'selection') {
        panel.querySelectorAll<HTMLElement>('mat-option')[1].click();
      } else {
        panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }));
      }
      fixture.detectChanges();
      const exit = panel.getAnimations().find((animation) =>
        (animation as CSSAnimation).animationName === '_mat-select-exit'
      );
      expect(exit).withContext('real Material closing animation is enabled').toBeDefined();
      // Check the frame after the fade completes but before animationend detaches
      // the overlay. Without a fill, the panel reverts to full opacity here.
      exit!.finish();
      expect(getComputedStyle(panel).opacity).toBe('0');
      expect(fixture.componentInstance.structuralSubTypeControl().value)
        .toBe(dismissal === 'selection' ? 'footer' : 'header');
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      await fixture.whenStable();
      expect(panel.isConnected).toBeFalse();
      select.open();
      fixture.detectChanges();
      await fixture.whenStable();
      const reopened = select.panel.nativeElement as HTMLElement;
      for (const animation of reopened.getAnimations()) animation.finish();
      expect(getComputedStyle(reopened).opacity).toBe('1');
      select.close();
    });
  }
});
