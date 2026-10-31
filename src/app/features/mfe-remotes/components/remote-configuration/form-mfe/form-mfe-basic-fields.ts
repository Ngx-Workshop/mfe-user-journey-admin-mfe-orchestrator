import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatTooltip } from '@angular/material/tooltip';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import type { MfeRemoteDomain } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import type { RemoteForm } from '../../../forms/mfe-remote-form';
import type { UrlVerificationState } from '../../../models/app.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-basic-fields' },
  selector: 'ngx-mfe-basic-fields',
  imports: [
    NgxButton,
    CdkCopyToClipboard,
    MatTooltip,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIcon,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinner,
  ],
  template: `
    @if (formGroup(); as mfeRemoteForm) {
      <div
        class="mfe-basic-fields__fields"
        [formGroup]="mfeRemoteForm"
      >
        @if (fields() !== 'url') {
          <mat-form-field
            subscriptSizing="dynamic"
            appearance="outline"
          >
            <mat-label>Display name</mat-label>
            <mat-icon matPrefix>label</mat-icon>
            <input
              formControlName="name"
              matInput
              autocomplete="off"
              placeholder="Customer dashboard"
            />
            <mat-hint
              >The name shown throughout the catalog.</mat-hint
            >
            @if (
              mfeRemoteForm.get('name')?.touched &&
              mfeRemoteForm.get('name')?.errors
            ) {
              <mat-error>{{ errorMessages()['name'] }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field
            subscriptSizing="dynamic"
            appearance="outline"
          >
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
        }
        @if (fields() !== 'details') {
          <mat-form-field
            subscriptSizing="dynamic"
            appearance="outline"
          >
            <mat-label>Domains</mat-label>
            <mat-select
              formControlName="domains"
              multiple
              panelClass="ngx-design-system-overlay"
            >
              @for (domain of domains; track domain.value) {
                <mat-option [value]="domain.value">{{
                  domain.label
                }}</mat-option>
              }
            </mat-select>
            <mat-hint
              >Choose the shells that load this remote. Leave empty to
              load in neither.</mat-hint
            >
          </mat-form-field>
        }
        @if (fields() !== 'details') {
          <div class="mfe-basic-fields__url-field">
            <mat-form-field
              subscriptSizing="dynamic"
              appearance="outline"
            >
              <mat-label>Remote entry URL</mat-label>
              <button
                mat-icon-button
                matPrefix
                type="button"
                aria-label="Copy remote entry URL"
                [disabled]="
                  !mfeRemoteForm.controls.remoteEntryUrl.value
                "
                [cdkCopyToClipboard]="
                  mfeRemoteForm.controls.remoteEntryUrl.value
                "
                (cdkCopyToClipboardCopied)="
                  copyStatus.set(
                    $event
                      ? 'Remote entry URL copied'
                      : 'Could not copy remote entry URL'
                  )
                "
                [matTooltip]="copyStatus() || 'Copy remote entry URL'"
                matTooltipClass="ngx-design-system-overlay"
              >
                <mat-icon>link</mat-icon>
              </button>
              <input
                formControlName="remoteEntryUrl"
                matInput
                type="url"
                autocomplete="url"
                placeholder="https://example.com/remoteEntry.js"
                (input)="copyStatus.set(''); urlChanged.emit()"
              />
              @switch (verificationState()) {
                @case ('success') {
                  <mat-hint
                    class="mfe-basic-fields__verification mfe-basic-fields__verification--success"
                  >
                    <mat-icon>check_circle</mat-icon>
                    Remote entry responded successfully.
                  </mat-hint>
                }
                @case ('error') {
                  <mat-hint
                    class="mfe-basic-fields__verification mfe-basic-fields__verification--error"
                  >
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
              mat-flat-button
              ngxButton
              surface="outline"
              tone="secondary"
              motion="pulse"
              shape="beveled"
              type="button"
              [disabled]="
                !mfeRemoteForm.controls.remoteEntryUrl.valid ||
                verificationState() === 'verifying'
              "
              (click)="verifyUrl()"
            >
              @if (verificationState() === 'verifying') {
                <span class="mfe-basic-fields__button-content">
                  <mat-progress-spinner
                    mode="indeterminate"
                    diameter="18"
                  ></mat-progress-spinner>
                  Checking
                </span>
              } @else {
                <span class="mfe-basic-fields__button-content">
                  <!-- <mat-icon>verified</mat-icon> -->
                  Verify
                </span>
              }
            </button>
          </div>
        }
      </div>
      <span
        class="mfe-basic-fields__copy-status"
        role="status"
        aria-live="polite"
        >{{ copyStatus() }}</span
      >
    }
  `,
  styles: [
    `
      :host {
        display: block;
        margin-top: 0.5rem;
      }

      .mfe-basic-fields__fields {
        display: grid;
        gap: 1rem;
      }

      .mfe-basic-fields__copy-status {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      mat-form-field {
        width: 100%;
      }

      textarea {
        resize: vertical;
      }

      .mfe-basic-fields__url-field {
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto;
        gap: 0.75rem;
        align-items: start;
      }

      .mfe-basic-fields__url-field > button {
        min-width: 126px;
        height: 56px;
      }

      .mfe-basic-fields__button-content,
      .mfe-basic-fields__verification {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
      }

      .mfe-basic-fields__button-content mat-icon {
        width: 1.15rem;
        height: 1.15rem;
        font-size: 1.15rem;
      }

      .mfe-basic-fields__verification mat-icon {
        width: 1rem;
        height: 1rem;
        font-size: 1rem;
      }

      .mfe-basic-fields__verification.mfe-basic-fields__verification--success {
        color: var(--ngx-color-success);
      }

      .mfe-basic-fields__verification.mfe-basic-fields__verification--error {
        color: var(--ngx-color-error);
      }

      @media (max-width: 620px) {
        .mfe-basic-fields__url-field {
          grid-template-columns: 1fr;
        }

        .mfe-basic-fields__url-field > button {
          width: 100%;
          margin-top: -0.5rem;
        }
      }
    `,
  ],
})
export class MfeBasicFields {
  readonly domains: { value: MfeRemoteDomain; label: string }[] = [
    { value: 'admin', label: 'Admin' },
    { value: 'workshop', label: 'Workshop' },
  ];
  readonly copyStatus = signal('');
  fields = input<'all' | 'url' | 'details'>('all');
  formGroup = input.required<RemoteForm>({ alias: 'mfeRemoteForm' });
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
