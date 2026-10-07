import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import type { RemoteForm } from '../../../forms/mfe-remote-form';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-capabilities' },
  selector: 'ngx-mfe-capabilities',
  imports: [ReactiveFormsModule, MatIcon, MatSlideToggleModule],
  template: `<div
    class="mfe-capabilities__layout"
    [formGroup]="form()"
  >
    <div class="mfe-capabilities__capability-heading">
      <div>
        <h4>Route capabilities</h4>
        <p>Choose how the host should integrate this journey.</p>
      </div>
      <span> {{ enabledCapabilityCount(form()) }}/3 enabled </span>
    </div>

    <div class="mfe-capabilities__capability-grid">
      <label class="mfe-capabilities__capability-card">
        <span class="mfe-capabilities__capability-icon">
          <mat-icon>route</mat-icon>
        </span>
        <span class="mfe-capabilities__capability-copy">
          <strong>Uses routes</strong>
          <small>Registers its own route configuration.</small>
        </span>
        <mat-slide-toggle
          formControlName="useRoutes"
          aria-label="Uses routes"
        ></mat-slide-toggle>
      </label>

      <label class="mfe-capabilities__capability-card">
        <span class="mfe-capabilities__capability-icon">
          <mat-icon>lock</mat-icon>
        </span>
        <span class="mfe-capabilities__capability-copy">
          <strong>Authentication</strong>
          <small>Requires an authenticated user session.</small>
        </span>
        <mat-slide-toggle
          formControlName="requiresAuth"
          aria-label="Requires authentication"
        ></mat-slide-toggle>
      </label>

      <label class="mfe-capabilities__capability-card">
        <span class="mfe-capabilities__capability-icon">
          <mat-icon>admin_panel_settings</mat-icon>
        </span>
        <span class="mfe-capabilities__capability-copy">
          <strong>Admin only</strong>
          <small>Restricts access to administrators.</small>
        </span>
        <mat-slide-toggle
          formControlName="isAdmin"
          aria-label="Admin only"
        ></mat-slide-toggle>
      </label>
    </div>
  </div>`,
  styles: [
    `
      .mfe-capabilities__layout {
        display: grid;
        gap: 1.25rem;
      }
      .mfe-capabilities__capability-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      h4,
      p {
        margin: 0;
      }

      h4 {
        font-size: 0.95rem;
        font-weight: 600;
      }

      p {
        margin-top: 0.2rem;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.78rem;
      }

      .mfe-capabilities__capability-heading > span {
        flex: 0 0 auto;
        padding: 0.3rem 0.55rem;
        color: var(--mat-sys-on-secondary-container);
        background: var(--mat-sys-secondary-container);
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 600;
      }

      .mfe-capabilities__capability-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.65rem;
      }

      .mfe-capabilities__capability-card {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 0.65rem;
        align-items: center;
        padding: 0.85rem;
        background: var(--mat-sys-surface);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 14px;
        cursor: pointer;
      }

      .mfe-capabilities__capability-card:has(
        .mat-mdc-slide-toggle-checked
      ) {
        background: var(--mat-sys-primary-container);
        border-color: color-mix(
          in srgb,
          var(--mat-sys-primary) 35%,
          var(--mat-sys-outline-variant)
        );
      }

      .mfe-capabilities__capability-icon {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        color: var(--mat-sys-primary);
        background: var(--mat-sys-surface-container);
        border-radius: 10px;
      }

      .mfe-capabilities__capability-icon mat-icon {
        width: 1.1rem;
        height: 1.1rem;
        font-size: 1.1rem;
      }

      .mfe-capabilities__capability-copy {
        min-width: 0;
      }

      .mfe-capabilities__capability-copy strong,
      .mfe-capabilities__capability-copy small {
        display: block;
      }

      .mfe-capabilities__capability-copy strong {
        font-size: 0.78rem;
      }

      .mfe-capabilities__capability-copy small {
        margin-top: 0.15rem;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.67rem;
        line-height: 1.35;
      }

      mat-slide-toggle {
        grid-column: 1 / -1;
        justify-self: end;
      }

      @media (max-width: 900px) {
        .mfe-capabilities__capability-grid {
          grid-template-columns: 1fr;
        }

        .mfe-capabilities__capability-card {
          grid-template-columns: auto minmax(0, 1fr) auto;
        }

        mat-slide-toggle {
          grid-column: auto;
        }
      }
    `,
  ],
})
export class MfeCapabilities {
  form = input.required<RemoteForm>();
  enabledCapabilityCount(form: RemoteForm) {
    return ['useRoutes', 'requiresAuth', 'isAdmin'].filter(
      (name) => form.get(name)?.value
    ).length;
  }
}
