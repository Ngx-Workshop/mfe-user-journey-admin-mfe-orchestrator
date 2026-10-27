import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

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
    MatFormFieldModule,
    MatSelectModule,
    MatExpansionModule,
  ],
  template: `
    <div
      class="mfe-structural-overrides__structural-overrides-group"
      [formGroup]="structuralOverridesForm()"
    >
      <mat-accordion>
        <mat-expansion-panel
          class="mfe-structural-overrides__panel"
          (opened)="panelOpenState.set(true)"
          (closed)="panelOpenState.set(false)"
        >
          <mat-expansion-panel-header
            class="mfe-structural-overrides__header"
          >
            <mat-panel-title>Shell overrides</mat-panel-title>
            <mat-panel-description
              class="mfe-structural-overrides__description"
            >
              Control which host regions remain visible
            </mat-panel-description>
          </mat-expansion-panel-header>
          <div class="mfe-structural-overrides__overrides-container">
            @for (region of regions; track region.control) {
              <mat-form-field
                appearance="outline"
                subscriptSizing="dynamic"
              >
                <mat-label>{{ region.label }}</mat-label>
                <mat-select
                  [formControlName]="region.control"
                  panelClass="ngx-design-system-overlay"
                >
                  @for (
                    mode of structuralOverrideModes;
                    track mode.value
                  ) {
                    <mat-option [value]="mode.value">{{
                      mode.label
                    }}</mat-option>
                  }
                </mat-select>
                <mat-hint>{{ region.description }}</mat-hint>
              </mat-form-field>
            }
          </div>
        </mat-expansion-panel>
      </mat-accordion>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        container-type: inline-size;
      }
      .mfe-structural-overrides__header {
        height: auto;
        min-height: 56px;
        padding-block: 0.5rem;
        box-sizing: border-box;
      }
      mat-panel-title {
        min-width: 0;
        overflow-wrap: anywhere;
      }
      .mfe-structural-overrides__panel {
        border: 1px solid var(--ngx-color-border);
      }
      .mfe-structural-overrides__description {
        justify-content: flex-end;
      }

      .mfe-structural-overrides__overrides-container {
        display: grid;
        grid-template-columns: repeat(
          auto-fit,
          minmax(min(100%, 180px), 1fr)
        );
        gap: 1rem;
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
      }

      @container (max-width: 600px) {
        mat-panel-description {
          display: none;
        }
      }
    `,
  ],
})
export class StructuralOverrides {
  structuralOverridesForm = input.required<FormGroup>();

  readonly regions = [
    {
      control: 'header',
      label: 'Header',
      description: 'Global branding and account controls',
    },
    {
      control: 'nav',
      label: 'Navigation',
      description: 'Primary application navigation',
    },
    {
      control: 'footer',
      label: 'Footer',
      description: 'Global links and legal information',
    },
  ];

  readonly panelOpenState = signal(false);

  structuralOverrideModes: StructuralOverrideModes = [
    { value: 'full', label: 'Full' },
    { value: 'compact', label: 'Compact' },
    { value: 'disabled', label: 'Disabled' },
  ];
}
