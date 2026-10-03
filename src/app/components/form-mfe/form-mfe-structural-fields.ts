import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import type { MfeRemoteType } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { StructuralOverrides } from './form-mfe-structural-overrides';
import { StructuralSubTypeOptions } from './form-mfe-structural-subtypes';

@Component({
  selector: 'ngx-structural-fields',
  imports: [
    ReactiveFormsModule,
    StructuralOverrides,
    StructuralSubTypeOptions,
    MatFormFieldModule,
    MatIcon,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  template: `
    @if (formGroup(); as mfeRemoteForm) {
      <div class="configuration" [formGroup]="mfeRemoteForm">
        <mat-form-field appearance="outline">
          <mat-label>Remote type</mat-label>
          <mat-icon matPrefix>category</mat-icon>
          <mat-select formControlName="type">
            @for (type of mfeTypes; track type) {
              <mat-option [value]="type">
                {{ type === 'user-journey' ? 'User journey' : 'Structural' }}
              </mat-option>
            }
          </mat-select>
          <mat-hint>
            {{
              mfeRemoteForm.get('type')?.value === 'user-journey'
                ? 'A feature experience that can participate in routing.'
                : 'A shared shell element such as a header or navigation.'
            }}
          </mat-hint>
        </mat-form-field>

        @if (mfeRemoteForm.get('type')?.value === 'user-journey') {
          <div class="capability-heading">
            <div>
              <h4>Route capabilities</h4>
              <p>Choose how the host should integrate this journey.</p>
            </div>
            <span>
              {{
                enabledCapabilityCount(mfeRemoteForm)
              }}/3 enabled
            </span>
          </div>

          <div class="capability-grid">
            <label class="capability-card">
              <span class="capability-icon">
                <mat-icon>route</mat-icon>
              </span>
              <span class="capability-copy">
                <strong>Uses routes</strong>
                <small>Registers its own route configuration.</small>
              </span>
              <mat-slide-toggle
                formControlName="useRoutes"
                aria-label="Uses routes"
              ></mat-slide-toggle>
            </label>

            <label class="capability-card">
              <span class="capability-icon">
                <mat-icon>lock</mat-icon>
              </span>
              <span class="capability-copy">
                <strong>Authentication</strong>
                <small>Requires an authenticated user session.</small>
              </span>
              <mat-slide-toggle
                formControlName="requiresAuth"
                aria-label="Requires authentication"
              ></mat-slide-toggle>
            </label>

            <label class="capability-card">
              <span class="capability-icon">
                <mat-icon>admin_panel_settings</mat-icon>
              </span>
              <span class="capability-copy">
                <strong>Admin only</strong>
                <small>Restricts access to administrators.</small>
              </span>
              <mat-slide-toggle
                formControlName="isAdmin"
                aria-label="Admin only"
              ></mat-slide-toggle>
            </label>
          </div>

          <ngx-structural-overrides
            [structuralOverridesForm]="
              $any(mfeRemoteForm.get('structuralOverrides'))
            "
          ></ngx-structural-overrides>
        } @else {
          <ngx-structural-subtypes
            [structuralSubTypeControl]="
              $any(mfeRemoteForm.get('structuralSubType'))
            "
          ></ngx-structural-subtypes>
        }
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .configuration {
        display: grid;
        gap: 1.25rem;
      }

      mat-form-field {
        width: 100%;
      }

      .capability-heading {
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

      .capability-heading > span {
        flex: 0 0 auto;
        padding: 0.3rem 0.55rem;
        color: var(--mat-sys-on-secondary-container);
        background: var(--mat-sys-secondary-container);
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 600;
      }

      .capability-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.65rem;
      }

      .capability-card {
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

      .capability-card:has(.mat-mdc-slide-toggle-checked) {
        background: var(--mat-sys-primary-container);
        border-color: color-mix(
          in srgb,
          var(--mat-sys-primary) 35%,
          var(--mat-sys-outline-variant)
        );
      }

      .capability-icon {
        display: grid;
        place-items: center;
        width: 34px;
        height: 34px;
        color: var(--mat-sys-primary);
        background: var(--mat-sys-surface-container);
        border-radius: 10px;
      }

      .capability-icon mat-icon {
        width: 1.1rem;
        height: 1.1rem;
        font-size: 1.1rem;
      }

      .capability-copy {
        min-width: 0;
      }

      .capability-copy strong,
      .capability-copy small {
        display: block;
      }

      .capability-copy strong {
        font-size: 0.78rem;
      }

      .capability-copy small {
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
        .capability-grid {
          grid-template-columns: 1fr;
        }

        .capability-card {
          grid-template-columns: auto minmax(0, 1fr) auto;
        }

        mat-slide-toggle {
          grid-column: auto;
        }
      }
    `,
  ],
})
export class StructuralFields {
  formGroup = input.required<FormGroup>({ alias: 'mfeRemoteForm' });
  mfeTypes: MfeRemoteType[] = ['user-journey', 'structural'];

  enabledCapabilityCount(form: FormGroup) {
    return ['useRoutes', 'requiresAuth', 'isAdmin'].filter(
      (controlName) => form.get(controlName)?.value
    ).length;
  }
}
