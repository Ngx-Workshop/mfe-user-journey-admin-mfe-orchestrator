import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import type { RemoteForm } from '../../../forms/mfe-remote-form';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-capabilities' },
  selector: 'ngx-mfe-capabilities',
  imports: [
    ReactiveFormsModule,
    MatIcon,
    MatSlideToggleModule,
    MatExpansionModule,
  ],
  template: ` <mat-accordion>
    <mat-expansion-panel class="mfe-capabilities__panel">
      <mat-expansion-panel-header class="mfe-capabilities__header">
        <mat-panel-title>Route capabilities</mat-panel-title>
        <mat-panel-description class="mfe-capabilities__count">
          {{ enabledCapabilityCount(form()) }}/2 enabled
        </mat-panel-description>
      </mat-expansion-panel-header>
      <div class="mfe-capabilities__layout" [formGroup]="form()">
        <p>Choose how the host should integrate this journey.</p>
        <div class="mfe-capabilities__capability-grid">
          <label
            class="mfe-capabilities__capability-card"
            [class.mfe-capabilities__capability-card--enabled]="
              form().controls.useRoutes.value
            "
          >
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

          <label
            class="mfe-capabilities__capability-card"
            [class.mfe-capabilities__capability-card--enabled]="
              form().controls.requiresAuth.value
            "
          >
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
        </div>
      </div>
    </mat-expansion-panel>
  </mat-accordion>`,
  styles: [
    `
      .mfe-capabilities__layout {
        display: grid;
        gap: 1.25rem;
      }
      :host {
        display: block;
        min-width: 0;
        container-type: inline-size;
      }

      .mfe-capabilities__header {
        height: auto;
        min-height: 56px;
        padding-block: 0.5rem;
        box-sizing: border-box;
      }
      mat-panel-title {
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .mfe-capabilities__panel {
        border: 1px solid var(--ngx-color-border);
      }

      .mfe-capabilities__count {
        flex: 0 0 auto;
        justify-content: flex-end;
        color: var(--ngx-color-secondary);
        font: var(--ngx-font-label);
        font-size: 0.68rem;
      }

      p {
        margin: 0;
        color: var(--ngx-color-muted);
        font-size: 0.78rem;
      }

      .mfe-capabilities__capability-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 0.65rem;
      }

      .mfe-capabilities__capability-card {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        gap: 0.65rem;
        align-items: center;
        padding: 0.85rem;
        background: var(--ngx-color-surface);
        border: 1px solid var(--ngx-color-border);
        border-radius: var(--ngx-radius);
        cursor: pointer;
      }

      .mfe-capabilities__capability-card--enabled {
        background: var(--ngx-color-surface);
        border-color: color-mix(
          in srgb,
          var(--ngx-color-primary) 35%,
          var(--ngx-color-border)
        );
      }

      .mfe-capabilities__capability-icon {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        color: var(--ngx-color-primary);
        background: var(--ngx-color-surface);
        border-radius: var(--ngx-radius);
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
        color: var(--ngx-color-muted);
        font-size: 0.67rem;
        line-height: 1.35;
      }

      mat-slide-toggle {
        grid-column: 1 / -1;
        justify-self: end;
      }

      @container (max-width: 600px) {
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
    return ['useRoutes', 'requiresAuth'].filter(
      (name) => form.get(name)?.value
    ).length;
  }
}
