import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatStepperModule } from '@angular/material/stepper';
import {
  NgxEntrance,
  NgxButton,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import { MfeBasicFields } from '../../components/remote-configuration/form-mfe/form-mfe-basic-fields';
import { StructuralFields } from '../../components/remote-configuration/form-mfe/form-mfe-structural-fields';
import { CreateMfeViewModel } from './create-mfe-view-model';

@Component({
  selector: 'ngx-create-mfe-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CreateMfeViewModel],
  imports: [
    NgxEntrance,
    AsyncPipe,
    ReactiveFormsModule,
    MatButton,
    MatStepperModule,
    NgxButton,
    NgxPanel,
    MfeBasicFields,
    StructuralFields,
  ],
  template: `
    <ngx-panel
      ngxEntrance="fade"
      heading="Create remote"
      eyebrow="REMOTE CONFIGURATION"
      shape="stepped"
      background="glass"
    >
      <mat-stepper
        #wizard
        linear
        orientation="vertical"
        [selectedIndex]="model.step()"
        (selectionChange)="model.step.set($event.selectedIndex)"
      >
        <mat-step
          label="Verify remote entry URL"
          [completed]="model.verification() === 'success'"
        >
          <ng-template matStepContent>
            <p>
              Enter the deployed remote entry URL and verify that it
              responds before continuing.
            </p>
            <ngx-mfe-basic-fields
              fields="url"
              [mfeRemoteForm]="model.form"
              [errorMessages]="model.errors"
              [verificationState]="model.verification()"
              (verifyUrlClick)="model.verify()"
            />
            <p
              class="create-mfe-page__status"
              role="status"
              aria-live="polite"
            >
              @switch (model.verification()) {
                @case ('verifying') {
                  Checking remote entry…
                }
                @case ('success') {
                  URL verified. Continue to remote details.
                }
                @case ('error') {
                  Verification failed. Check the URL and try again.
                }
              }
            </p>
          </ng-template>
        </mat-step>
        <mat-step
          label="Display name and description"
          [stepControl]="model.form.controls.name"
        >
          <ng-template matStepContent>
            <ngx-mfe-basic-fields
              fields="details"
              [mfeRemoteForm]="model.form"
              [errorMessages]="model.errors"
            />
          </ng-template>
        </mat-step>
        <mat-step label="Integration behavior">
          <ng-template matStepContent>
            <ngx-structural-fields [mfeRemoteForm]="model.form" />
          </ng-template>
        </mat-step>
      </mat-stepper>
      <div ngxPanelActions class="create-mfe-page__panel-actions">
        @if (model.step() === 0) {
          <button
            mat-flat-button
            ngxButton
            shape="chevron"
            type="button"
            [disabled]="model.verification() !== 'success'"
            (click)="wizard.next()"
          >
            Continue to details
          </button>
        } @else if (model.step() === 1) {
          <button
            mat-flat-button
            ngxButton
            shape="chevron"
            type="button"
            [disabled]="model.form.controls.name.invalid"
            (click)="wizard.next()"
          >
            Continue to integration
          </button>
        } @else if (model.step() === 2) {
          <button
            mat-flat-button
            ngxButton
            shape="chevron"
            type="button"
            [disabled]="
              model.form.invalid ||
              model.verification() !== 'success' ||
              model.submitting() ||
              ((model.store.state$ | async)?.pending ?? 0) > 0
            "
            (click)="model.create()"
          >
            {{ model.submitting() ? 'Creating…' : 'Create' }}
          </button>
        }
      </div>
    </ngx-panel>
  `,
  styles: [
    `
      :host {
        display: block;
        box-sizing: border-box;
        width: 100%;
        max-width: 765px;
        min-width: 0;
        margin-inline: auto;
      }
      mat-stepper {
        background: transparent;
        color: var(--ngx-color-text);
      }
      p {
        color: var(--ngx-color-muted);
      }
      .create-mfe-page__panel-actions {
        display: flex;
        justify-content: flex-end;
        width: 100%;
      }
      .create-mfe-page__status {
        min-height: 1.5em;
      }
    `,
  ],
})
export class CreateMfePage {
  readonly model = inject(CreateMfeViewModel);
}
