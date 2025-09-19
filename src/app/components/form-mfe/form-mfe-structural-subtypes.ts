import { UpperCasePipe } from '@angular/common';
import { Component, input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';

import type { StructuralSubType } from '@tmdjr/ngx-mfe-orchestrator-contracts';

type StructuralSubTypes = {
  value: StructuralSubType;
  label: string;
}[];

@Component({
  selector: 'ngx-structural-subtypes',
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatExpansionModule,
    UpperCasePipe,
  ],
  template: `
    <mat-form-field>
      <mat-label>Type</mat-label>
      <mat-select [formControl]="structuralSubTypeControl()">
        @for (type of structuralSubTypes; track type) {
        <mat-option [value]="type.value">{{
          type.label | uppercase
        }}</mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
})
export class StructuralSubTypeOptions {
  structuralSubTypeControl = input.required<FormControl>();

  readonly panelOpenState = signal(false);

  structuralSubTypes: StructuralSubTypes = [
    { value: 'header', label: 'Header' },
    { value: 'footer', label: 'Footer' },
    { value: 'nav', label: 'Navigation' },
  ];
}
