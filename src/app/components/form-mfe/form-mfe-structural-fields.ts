import { MfeCapabilities } from './form-mfe-capabilities';
import type { RemoteForm } from '../../view-models/mfe-form-view-model';
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import type { MfeRemoteType } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { StructuralOverrides } from './form-mfe-structural-overrides';
import { StructuralSubTypeOptions } from './form-mfe-structural-subtypes';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
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
        <mat-form-field appearance="outline">
          <mat-label>Remote type</mat-label>
          <mat-icon matPrefix>category</mat-icon>
          <mat-select formControlName="type">
            @for (type of mfeTypes; track type) {
              <mat-option [value]="type">
                {{
                  type === 'user-journey'
                    ? 'User journey'
                    : 'Structural'
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
      :host {
        display: block;
      }

      .mfe-structural-fields__configuration {
        display: grid;
        gap: 1.25rem;
      }

      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class StructuralFields {
  formGroup = input.required<RemoteForm>({ alias: 'mfeRemoteForm' });
  mfeTypes: MfeRemoteType[] = ['user-journey', 'structural'];
}
