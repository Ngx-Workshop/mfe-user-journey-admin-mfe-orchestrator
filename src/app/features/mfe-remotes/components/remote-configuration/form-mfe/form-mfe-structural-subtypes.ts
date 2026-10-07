import {
  ChangeDetectionStrategy,
  Component,
  input,
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
  host: { class: 'mfe-structural-subtypes' },
  selector: 'ngx-structural-subtypes',
  imports: [ReactiveFormsModule, MatSelectModule, MatIcon],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Structural placement</mat-label>
      <mat-icon matPrefix>view_quilt</mat-icon>
      <mat-select [formControl]="structuralSubTypeControl()">
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
      :host {
        display: block;
      }

      mat-form-field {
        width: 100%;
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
