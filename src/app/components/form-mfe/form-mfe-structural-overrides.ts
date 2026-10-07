import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import {
  MatRadioButton,
  MatRadioGroup,
} from '@angular/material/radio';

import type { StructuralOverrideMode } from '@tmdjr/ngx-mfe-orchestrator-contracts';

type StructuralOverrideModes = {
  value: StructuralOverrideMode;
  label: string;
}[];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-structural-overrides' },
  selector: 'ngx-structural-overrides',
  imports: [
    ReactiveFormsModule,
    MatRadioGroup,
    MatRadioButton,
    MatExpansionModule,
  ],
  template: `
    <div
      class="mfe-structural-overrides__structural-overrides-group"
      [formGroup]="structuralOverridesForm()"
    >
      <mat-accordion>
        <mat-expansion-panel
          (opened)="panelOpenState.set(true)"
          (closed)="panelOpenState.set(false)"
        >
          <mat-expansion-panel-header>
            <mat-panel-title>Shell overrides</mat-panel-title>
            <mat-panel-description>
              Control which host regions remain visible
            </mat-panel-description>
          </mat-expansion-panel-header>
          <div class="mfe-structural-overrides__overrides-container">
            <div class="mfe-structural-overrides__override-section">
              <div>
                <label>Header</label>
                <small>Global branding and account controls</small>
              </div>
              <mat-radio-group formControlName="header">
                @for (
                  mode of structuralOverrideModes;
                  track mode.value
                ) {
                  <mat-radio-button [value]="mode.value">{{
                    mode.label
                  }}</mat-radio-button>
                }
              </mat-radio-group>
            </div>

            <div class="mfe-structural-overrides__override-section">
              <div>
                <label>Navigation</label>
                <small>Primary application navigation</small>
              </div>
              <mat-radio-group formControlName="nav">
                @for (
                  mode of structuralOverrideModes;
                  track mode.value
                ) {
                  <mat-radio-button [value]="mode.value">{{
                    mode.label
                  }}</mat-radio-button>
                }
              </mat-radio-group>
            </div>

            <div class="mfe-structural-overrides__override-section">
              <div>
                <label>Footer</label>
                <small>Global links and legal information</small>
              </div>
              <mat-radio-group formControlName="footer">
                @for (
                  mode of structuralOverrideModes;
                  track mode.value
                ) {
                  <mat-radio-button [value]="mode.value">{{
                    mode.label
                  }}</mat-radio-button>
                }
              </mat-radio-group>
            </div>
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styles: [
    `
      mat-panel-description.mat-expansion-panel-header-description {
        justify-content: flex-end;
      }

      .mfe-structural-overrides__structural-overrides-group {
        .mfe-structural-overrides__overrides-container {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;

          .mfe-structural-overrides__override-section {
            display: grid;
            grid-template-columns: minmax(150px, 0.7fr) 1.3fr;
            gap: 1rem;
            align-items: center;
            padding: 0.75rem;
            background: var(--mat-sys-surface-container-low);
            border-radius: 12px;

            label {
              display: block;
              font-weight: 500;
              font-size: 0.9em;
            }

            small {
              display: block;
              margin-top: 0.15rem;
              color: var(--mat-sys-on-surface-variant);
              font-size: 0.68rem;
            }

            mat-radio-group {
              display: grid;
              grid-template-columns: repeat(
                auto-fit,
                minmax(120px, 1fr)
              );
              gap: 1rem;
              align-items: center;
            }
          }
        }
      }

      @media (max-width: 700px) {
        mat-panel-description {
          display: none;
        }

        .mfe-structural-overrides__structural-overrides-group
          .mfe-structural-overrides__overrides-container {
          .mfe-structural-overrides__override-section {
            grid-template-columns: 1fr;
          }
        }
      }
    `,
  ],
})
export class StructuralOverrides {
  structuralOverridesForm = input.required<FormGroup>();

  readonly panelOpenState = signal(false);

  structuralOverrideModes: StructuralOverrideModes = [
    { value: 'full', label: 'Full' },
    { value: 'compact', label: 'Compact' },
    { value: 'disabled', label: 'Disabled' },
  ];
}
