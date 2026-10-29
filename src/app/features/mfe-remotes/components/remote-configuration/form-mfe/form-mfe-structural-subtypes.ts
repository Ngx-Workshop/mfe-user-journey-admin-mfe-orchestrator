import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import type { StructuralSubType } from '@tmdjr/ngx-mfe-orchestrator-contracts';

type StructuralSubTypes = {
  value: StructuralSubType;
  label: string;
}[];

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The select panel is portaled outside this host, including in federated mode.
  encapsulation: ViewEncapsulation.None,
  host: { class: 'mfe-structural-subtypes' },
  selector: 'ngx-structural-subtypes',
  imports: [ReactiveFormsModule, MatSelectModule, MatIcon],
  template: `
    <mat-form-field subscriptSizing="dynamic" appearance="outline">
      <mat-label>Structural placement</mat-label>
      <mat-icon matPrefix>view_quilt</mat-icon>
      <mat-select
        panelClass="ngx-design-system-overlay mfe-structural-subtypes__placement-panel"
        [formControl]="structuralSubTypeControl()"
      >
        @for (type of structuralSubTypes; track type) {
          <mat-option [value]="type.value">{{
            type.label
          }}</mat-option>
        }
      </mat-select>
      <mat-hint>
        Select the shell region this remote is responsible for.
      </mat-hint>
    </mat-form-field>
  `,
  styles: [
    `
      .mfe-structural-subtypes {
        display: block;
      }

      .mfe-structural-subtypes mat-form-field {
        width: 100%;
      }

      .mfe-structural-subtypes__placement-panel {
        // Keep the final fade frame until Material detaches the overlay.
        animation-fill-mode: forwards !important;
      }
    `,
  ],
})
export class StructuralSubTypeOptions {
  structuralSubTypeControl = input.required<FormControl>();

  structuralSubTypes: StructuralSubTypes = [
    { value: 'header', label: 'Header' },
    { value: 'footer', label: 'Footer' },
    { value: 'nav', label: 'Navigation' },
  ];
}
