import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'form-section' },
  selector: 'ngx-form-section',
  imports: [MatIcon],
  template: `
    <section class="form-section">
      <div class="form-section__heading">
        <span class="form-section__icon"
          ><mat-icon>{{ icon() }}</mat-icon></span
        >
        <div>
          <h3>{{ heading() }}</h3>
          <p>{{ description() }}</p>
        </div>
        @if (requiredNote()) {
          <span class="form-section__required"
            >Required fields marked *</span
          >
        }
      </div>
      <ng-content />
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .form-section {
        padding: 1.15rem;
        background: var(--mat-sys-surface-container-lowest);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
      }

      .form-section__heading {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      .form-section__icon {
        display: grid;
        flex: 0 0 auto;
        place-items: center;
        width: 40px;
        height: 40px;
        color: var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
        border-radius: 12px;
      }

      .form-section__icon mat-icon {
        width: 1.25rem;
        height: 1.25rem;
        font-size: 1.25rem;
      }

      h3,
      p {
        margin: 0;
      }

      h3 {
        font-size: 1rem;
        font-weight: 600;
      }

      p {
        margin-top: 0.2rem;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.76rem;
        line-height: 1.4;
      }

      .form-section__required {
        margin-left: auto;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.65rem;
        white-space: nowrap;
      }

      @media (max-width: 620px) {
        .form-section {
          padding: 0.85rem;
        }

        .form-section__heading {
          align-items: flex-start;
        }

        .form-section__required {
          display: none;
        }
      }
    `,
  ],
})
export class FormSection {
  heading = input.required<string>();
  description = input.required<string>();
  icon = input.required<string>();
  requiredNote = input(false);
}
