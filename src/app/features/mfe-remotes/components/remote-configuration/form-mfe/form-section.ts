import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  viewChild,
  input,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'form-section' },
  selector: 'ngx-form-section',
  imports: [MatIcon, NgxPanel],
  template: `
    <ngx-panel
      [heading]="heading()"
      eyebrow="CONFIGURATION"
      shape="chamfered"
      background="solid"
    >
      <div #content class="form-section__content">
        <div class="form-section__heading">
          <span class="form-section__icon"
            ><mat-icon>{{ icon() }}</mat-icon></span
          >
          <div>
            <p>{{ description() }}</p>
          </div>
          <!-- @if (requiredNote()) {
          <span class="form-section__required"
            >Required fields marked *</span
          >
        } -->
        </div>
        <ng-content />
      </div>
    </ngx-panel>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      :host.form-section--growing {
        overflow: clip;
      }
      .form-section__heading {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ngx-space-2);
        margin-bottom: var(--ngx-space-6);
        padding-bottom: var(--ngx-space-4);
        border-bottom: 1px solid var(--ngx-color-border);
      }
      .form-section__icon {
        color: var(--ngx-color-primary);
      }
      .form-section__heading > div {
        flex: 1 1 180px;
      }
      p {
        margin: 0;
        color: var(--ngx-color-muted);
        font-size: 0.8rem;
        line-height: 1.5;
      }
      .form-section__required {
        color: var(--ngx-color-muted);
        font: var(--ngx-font-label);
      }
    `,
  ],
})
export class FormSection {
  introDelay = input(280);
  contentDelay = input(820);
  private readonly content =
    viewChild.required<ElementRef<HTMLElement>>('content');

  constructor() {
    const host =
      inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const viewport = host.ownerDocument.defaultView!;
      const preference = viewport.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );
      if (preference.matches) return;
      // Measure the fully rendered layout, then animate actual height rather than
      // scaling text or imposing a max-height on responsive/expanded content.
      const intrinsicHeight = host.getBoundingClientRect().height;
      host.classList.add('form-section--growing');
      const growth = host.animate(
        [{ height: '150px' }, { height: `${intrinsicHeight}px` }],
        {
          delay: this.introDelay(),
          duration: 420,
          easing: 'cubic-bezier(.2,.7,.2,1)',
          fill: 'backwards',
        }
      );
      const content = this.content().nativeElement;
      const reveal = content.animate(
        [{ opacity: 0 }, { opacity: 1 }],
        {
          delay: this.contentDelay(),
          duration: 220,
          easing: 'ease-out',
          fill: 'backwards',
        }
      );
      const restore = () => {
        growth.cancel();
        reveal.cancel();
        host.classList.remove('form-section--growing');
      };
      void growth.finished.then(
        () => host.classList.remove('form-section--growing'),
        () => {}
      );
      // A changed viewport or reduced-motion setting should expose the current
      // intrinsic layout immediately, with no stale measured height.
      viewport.addEventListener('resize', restore);
      preference.addEventListener('change', restore);
      content.addEventListener('focusin', restore);
      destroyRef.onDestroy(() => {
        restore();
        viewport.removeEventListener('resize', restore);
        preference.removeEventListener('change', restore);
        content.removeEventListener('focusin', restore);
      });
    });
  }

  heading = input.required<string>();
  description = input.required<string>();
  icon = input.required<string>();
  requiredNote = input(false);
}
