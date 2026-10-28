import { NgxEntrance } from '@tmdjr/ngx-workshop-design-system';
import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormSection } from '../../../../../../../src/app/features/mfe-remotes/components/remote-configuration/form-mfe/form-section';

@Component({
  imports: [FormSection, NgxEntrance],
  template: `<ngx-form-section
    heading="Remote details"
    description="Describe the remote"
    icon="description"
    ngxEntrance="grow"
    [entranceDelay]="280"
    [entranceDuration]="420"
    [contentDelay]="820"
  >
    <div class="test-content" [style.height.px]="contentHeight()">
      Configuration fields
    </div>
  </ngx-form-section>`,
})
class SectionHost {
  contentHeight = signal(360);
}

describe('Staged configuration panel entrance', () => {
  let fixture: ComponentFixture<SectionHost>;
  let reduced: boolean;

  beforeEach(async () => {
    reduced = false;
    const preference = new EventTarget();
    Object.defineProperty(preference, 'matches', {
      get: () => reduced,
    });
    spyOn(window, 'matchMedia').and.returnValue(
      preference as MediaQueryList
    );
    await TestBed.configureTestingModule({
      imports: [SectionHost],
    }).compileComponents();
  });

  async function render() {
    fixture = TestBed.createComponent(SectionHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const section = fixture.nativeElement.querySelector(
      'ngx-form-section'
    ) as HTMLElement;
    const content = section.querySelector(
      '.form-section__content'
    ) as HTMLElement;
    return { section, content };
  }

  it('grows from 150px to measured height before revealing content and then restores intrinsic sizing', async () => {
    const { section, content } = await render();
    const growth = section.getAnimations()[0];
    const reveal = content.getAnimations()[0];
    growth.pause();
    reveal.pause();
    growth.currentTime = 0;
    reveal.currentTime = 0;
    const frames = (growth.effect as KeyframeEffect).getKeyframes();
    const naturalHeight = parseFloat(
      frames.at(-1)!['height'] as string
    );
    expect(naturalHeight).toBeGreaterThan(150);
    expect(section.getBoundingClientRect().height).toBeCloseTo(
      150,
      0
    );
    expect(getComputedStyle(content).opacity).toBe('0');
    // The content delay begins after the last child panel finishes growing.
    expect(reveal.effect!.getTiming().delay).toBeGreaterThan(
      Number(growth.effect!.getTiming().delay) +
        Number(growth.effect!.getTiming().duration)
    );
    growth.finish();
    await growth.finished;
    expect(section.getBoundingClientRect().height).toBeCloseTo(
      naturalHeight,
      0
    );
    expect(getComputedStyle(section).overflow).toBe('visible');
    expect(getComputedStyle(content).opacity).toBe('0');
    reveal.finish();
    await reveal.finished;
    expect(getComputedStyle(content).opacity).toBe('1');
    fixture.componentInstance.contentHeight.update(
      (height) => height + 180
    );
    fixture.detectChanges();
    await fixture.whenStable();
    expect(section.getBoundingClientRect().height).toBeCloseTo(
      naturalHeight + 180,
      0
    );
    expect(section.style.height).toBe('');
  });

  it('cancels measured animations on resize and exposes the live layout', async () => {
    const { section, content } = await render();
    window.dispatchEvent(new Event('resize'));
    expect(section.getAnimations().length).toBe(0);
    expect(content.getAnimations().length).toBe(0);
    expect(getComputedStyle(section).overflow).toBe('visible');
    expect(section.getBoundingClientRect().height).toBeGreaterThan(
      150
    );
    expect(getComputedStyle(content).opacity).toBe('1');
  });

  it('shows intrinsic panels and content immediately for reduced motion', async () => {
    reduced = true;
    const { section, content } = await render();
    expect(section.getAnimations().length).toBe(0);
    expect(content.getAnimations().length).toBe(0);
    expect(section.getBoundingClientRect().height).toBeGreaterThan(
      150
    );
    expect(getComputedStyle(content).opacity).toBe('1');
  });
});
