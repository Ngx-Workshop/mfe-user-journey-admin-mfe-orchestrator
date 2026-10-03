import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

export type UrlVerificationState =
  | 'idle'
  | 'verifying'
  | 'success'
  | 'error';

@Component({
  selector: 'ngx-mfe-basic-fields',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIcon,
    MatInputModule,
    MatProgressSpinner,
  ],
  template: `
    @if (formGroup(); as mfeRemoteForm) {
      <div class="fields" [formGroup]="mfeRemoteForm">
        <mat-form-field appearance="outline">
          <mat-label>Display name</mat-label>
          <mat-icon matPrefix>label</mat-icon>
          <input
            formControlName="name"
            matInput
            autocomplete="off"
            placeholder="Customer dashboard"
          />
          <mat-hint>The name shown throughout the catalog.</mat-hint>
          @if (
            mfeRemoteForm.get('name')?.touched &&
            mfeRemoteForm.get('name')?.errors
          ) {
            <mat-error>{{ errorMessages()['name'] }}</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Description</mat-label>
          <mat-icon matPrefix>notes</mat-icon>
          <textarea
            formControlName="description"
            matInput
            rows="3"
            placeholder="What does this remote provide?"
          ></textarea>
          <mat-hint>
            Help administrators understand when this remote is used.
          </mat-hint>
        </mat-form-field>

        <div class="url-field">
          <mat-form-field appearance="outline">
            <mat-label>Remote entry URL</mat-label>
            <mat-icon matPrefix>link</mat-icon>
            <input
              formControlName="remoteEntryUrl"
              matInput
              type="url"
              autocomplete="url"
              placeholder="https://example.com/remoteEntry.js"
              (input)="urlChanged.emit()"
            />
            @switch (verificationState()) {
              @case ('success') {
                <mat-hint class="verification success">
                  <mat-icon>check_circle</mat-icon>
                  Remote entry responded successfully.
                </mat-hint>
              }
              @case ('error') {
                <mat-hint class="verification error">
                  <mat-icon>error</mat-icon>
                  We could not verify this remote entry.
                </mat-hint>
              }
              @default {
                <mat-hint>
                  The deployed module federation entry point.
                </mat-hint>
              }
            }
            @if (
              mfeRemoteForm.get('remoteEntryUrl')?.touched &&
              mfeRemoteForm.get('remoteEntryUrl')?.errors
            ) {
              <mat-error>
                {{ errorMessages()['remoteEntryUrl'] }}
              </mat-error>
            }
          </mat-form-field>

          <button
            matButton="tonal"
            type="button"
            [disabled]="
              !mfeRemoteForm.get('remoteEntryUrl')?.value ||
              verificationState() === 'verifying'
            "
            (click)="verifyUrl()"
          >
            @if (verificationState() === 'verifying') {
              <span class="button-content">
                <mat-progress-spinner
                  mode="indeterminate"
                  diameter="18"
                ></mat-progress-spinner>
                Checking
              </span>
            } @else {
              <span class="button-content">
                <mat-icon>verified</mat-icon>
                Verify URL
              </span>
            }
          </button>
        </div>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .fields {
        display: grid;
        gap: 1rem;
      }

      mat-form-field {
        width: 100%;
      }

      textarea {
        resize: vertical;
      }

      .url-field {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.75rem;
        align-items: start;
      }

      .url-field > button {
        min-width: 126px;
        height: 56px;
      }

      .button-content,
      .verification {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }

      .button-content mat-icon {
        width: 1.15rem;
        height: 1.15rem;
        font-size: 1.15rem;
      }

      .verification mat-icon {
        width: 1rem;
        height: 1rem;
        font-size: 1rem;
      }

      .verification.success {
        color: #247a52;
      }

      .verification.error {
        color: var(--mat-sys-error);
      }

      @media (max-width: 620px) {
        .url-field {
          grid-template-columns: 1fr;
        }

        .url-field > button {
          width: 100%;
          margin-top: -0.5rem;
        }
      }
    `,
  ],
})
export class MfeBasicFields {
  formGroup = input.required<FormGroup>({ alias: 'mfeRemoteForm' });
  errorMessages = input.required<{ [key: string]: string }>();
  verificationState = input<UrlVerificationState>('idle');

  verifyUrlClick = output<string>();
  urlChanged = output<void>();

  verifyUrl() {
    const url = this.formGroup().get('remoteEntryUrl')?.value;
    if (url) {
      this.verifyUrlClick.emit(url);
    }
  }
}
