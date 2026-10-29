import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import type { MfeRemoteType } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import type { RemoteForm } from '../../../forms/mfe-remote-form';
import { MfeCapabilities } from './form-mfe-capabilities';
import { StructuralOverrides } from './form-mfe-structural-overrides';
import { StructuralSubTypeOptions } from './form-mfe-structural-subtypes';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The select panel is portaled outside this host, including in federated mode.
  encapsulation: ViewEncapsulation.None,
  host: { class: 'mfe-structural-fields' },
  selector: 'ngx-structural-fields',
  imports: [
    ReactiveFormsModule,
    StructuralOverrides,
    StructuralSubTypeOptions,
    MatFormFieldModule,
    MatIcon,
    MatSelectModule,
    MfeCapabilities,
  ],
  template: `
    @if (formGroup(); as mfeRemoteForm) {
    <div
      class="mfe-structural-fields__configuration"
      [formGroup]="mfeRemoteForm"
    >
      <mat-form-field subscriptSizing="dynamic" appearance="outline">
        <mat-label>Remote type</mat-label>
        <mat-icon matPrefix>category</mat-icon>
        <mat-select
          panelClass="ngx-design-system-overlay mfe-structural-fields__type-panel"
          formControlName="type"
        >
          @for (type of mfeTypes; track type) {
          <mat-option [value]="type">
            {{
              type === 'user-journey' ? 'User journey' : 'Structural'
            }}
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
      <ngx-mfe-capabilities [form]="mfeRemoteForm" />

      <ngx-structural-overrides
        [structuralOverridesForm]="
          mfeRemoteForm.controls.structuralOverrides
        "
      ></ngx-structural-overrides>
      } @else {
      <ngx-structural-subtypes
        [structuralSubTypeControl]="
          mfeRemoteForm.controls.structuralSubType
        "
      ></ngx-structural-subtypes>
      }
    </div>
    }
  `,
  styles: [
    `
      .mfe-structural-fields {
        display: block;
        margin-top: 0.5rem;
      }

      .mfe-structural-fields__configuration {
        display: grid;
        gap: 1.25rem;
      }

      .mfe-structural-fields mat-form-field {
        width: 100%;
      }

      .mfe-structural-fields__type-panel {
        // Material's animation shorthand resets fill-mode. Keep the final fade
        // frame until its animationend handler detaches the overlay.
        animation-fill-mode: forwards !important;
      }
    `,
  ],
})
export class StructuralFields {
  formGroup = input.required<RemoteForm>({ alias: 'mfeRemoteForm' });
  mfeTypes: MfeRemoteType[] = ['user-journey', 'structural'];
}
