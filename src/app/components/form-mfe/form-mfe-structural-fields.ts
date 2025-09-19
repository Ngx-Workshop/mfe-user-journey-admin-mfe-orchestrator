import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StructuralOverrides } from './form-mfe-structural-overrides';
import { StructuralSubTypeOptions } from './form-mfe-structural-subtypes';

import type { MfeRemoteType } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Component({
  selector: 'ngx-structural-fields',
  imports: [
    ReactiveFormsModule,
    StructuralOverrides,
    StructuralSubTypeOptions,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
  ],
  template: `
    @if(formGroup(); as mfeRemoteForm) {
    <div [formGroup]="mfeRemoteForm">
      <mat-form-field>
        <mat-label>Type</mat-label>
        <mat-select formControlName="type">
          @for (type of mfeTypes; track type) {
          <mat-option [value]="type">{{ type }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      @if (mfeRemoteForm.get('type')?.value === 'user-journey') {
      <mat-slide-toggle formControlName="useRoutes">
        <b>
          Uses Routes
          {{
            mfeRemoteForm.get('useRoutes')?.value ? 'On' : 'Off'
          }}</b
        >
      </mat-slide-toggle>
      <mat-slide-toggle formControlName="requiresAuth">
        <b>
          Authenticated Route
          {{
            mfeRemoteForm.get('requiresAuth')?.value ? 'On' : 'Off'
          }}</b
        >
      </mat-slide-toggle>
      <mat-slide-toggle formControlName="requiresAuth">
        <b>
          Is Admin Route
          {{ mfeRemoteForm.get('isAdmin')?.value ? 'On' : 'Off' }}</b
        >
      </mat-slide-toggle>
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
        display: contents;
        > div {
          display: contents;
          ngx-structural-overrides {
            margin-bottom: 1.7rem;
          }
        }

        mat-slide-toggle {
          margin: 1rem 0;
        }
      }
    `,
  ],
})
export class StructuralFields {
  formGroup = input.required<FormGroup>({ alias: 'mfeRemoteForm' });
  mfeTypes: MfeRemoteType[] = ['structural', 'user-journey'];
}
