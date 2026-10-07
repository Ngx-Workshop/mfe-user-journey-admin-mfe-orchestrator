import { NgClass } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { lastValueFrom, tap } from 'rxjs';
import { MfeRemoteDtoExtraProps } from '../app.types';
import { ConfirmDeleteDialog } from './dialog/dialog-confirm-delete';
import { DevModeOptions } from './dialog/dialog-dev-mode-options';
import { MfePreview } from './dialog/dialog-mfe-preview';
import { MfeForm } from './form-mfe/form-mfe';
import { MfeRemoteCardHeader } from './mfe-remote-card-header';

@Component({
  selector: 'ngx-mfe-remote',
  imports: [
    MatCardModule,
    MatButton,
    MatIcon,
    MfeForm,
    MfeRemoteCardHeader,
    NgClass,
  ],
  template: `
    @if (initialValue(); as mfe) {
    <mat-card
      appearance="filled"
      [ngClass]="{ 'dev-mode': mfe.isDevMode }"
    >
      <div class="card-heading">
        <div>
          <div class="title-row">
            <h3>Configuration</h3>
            <span class="type-badge">{{ mfe.type }}</span>
            @if (mfe.isDevMode) {
            <span class="dev-badge">
              <mat-icon>code</mat-icon>
              Dev mode
            </span>
            }
          </div>
          <p>{{ mfe.description || 'No description provided.' }}</p>
        </div>
      </div>

      <mat-card-header>
        <ngx-mfe-remote-card-header
          [initialValue]="initialValue()"
          (openDevModeOptions)="openDevModeOptions(mfe)"
          (previewMfeRemote)="previewMfeRemote(mfe)"
        ></ngx-mfe-remote-card-header>
      </mat-card-header>

      <mat-card-content>
        <ngx-mfe-form
          [initialValue]="initialValue()"
          (formStatus)="disableUpdateButton = $event !== 'VALID'"
          (valueChange)="mfeRemote = $event"
        ></ngx-mfe-form>
      </mat-card-content>

      <mat-card-actions>
        <button
          matButton
          class="delete-action"
          (click)="deleteRemote()"
        >
          <mat-icon>delete</mat-icon>
          Delete
        </button>
        <button matButton (click)="archive.emit(mfe)">
          <mat-icon>{{
            mfe.archived ? 'unarchive' : 'archive'
          }}</mat-icon>
          {{ mfe.archived ? 'Unarchive' : 'Archive' }}
        </button>
        <div class="flex-spacer"></div>
        <button
          matButton="filled"
          (click)="updateRemote()"
          [disabled]="disableUpdateButton"
        >
          <mat-icon>save</mat-icon>
          Save changes
        </button>
      </mat-card-actions>
    </mat-card>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      mat-card {
        overflow: hidden;
        background: var(--mat-sys-surface-container-low);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
        box-shadow: none;
      }

      .card-heading {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.25rem 1.25rem 1rem;
        background: var(--mat-sys-surface);
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      .title-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        align-items: center;
      }

      .card-heading h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .card-heading p {
        max-width: 720px;
        margin: 0.45rem 0 0;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.85rem;
        line-height: 1.5;
      }

      .type-badge,
      .dev-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.55rem;
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 600;
        text-transform: capitalize;
      }

      .type-badge {
        color: var(--mat-sys-on-secondary-container);
        background: var(--mat-sys-secondary-container);
      }

      .dev-badge {
        gap: 0.25rem;
        color: var(--mat-sys-on-error-container);
        background: var(--mat-sys-error-container);
      }

      .dev-badge mat-icon {
        width: 0.9rem;
        height: 0.9rem;
        font-size: 0.9rem;
      }

      mat-card-header {
        padding: 1rem 1.25rem 0;
      }

      mat-card-content {
        display: flex;
        flex-direction: column;
        padding: 0 1.25rem 1.25rem;
      }

      mat-card-actions {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        gap: 0.35rem;
        padding: 1rem 1.25rem;
        background: var(--mat-sys-surface);
        border-top: 1px solid var(--mat-sys-outline-variant);
      }

      .delete-action {
        color: var(--mat-sys-error);
      }

      .flex-spacer {
        flex: 1;
      }

      .dev-mode {
        border-color: color-mix(
          in srgb,
          var(--mat-sys-error) 48%,
          var(--mat-sys-outline-variant)
        );
        box-shadow: 0 0 0 3px
          color-mix(in srgb, var(--mat-sys-error) 8%, transparent);
      }

      @media (max-width: 600px) {
        mat-card-actions .flex-spacer {
          display: none;
        }

        mat-card-actions button:last-child {
          width: 100%;
          margin-top: 0.35rem;
        }
      }
    `,
  ],
})
export class MfeRemoteCard {
  dialog = inject(MatDialog);
  formBuilder = inject(FormBuilder);
  initialValue = input.required<MfeRemoteDtoExtraProps>();

  mfeRemote: Partial<MfeRemoteDtoExtraProps> = {};

  update = output<MfeRemoteDtoExtraProps>();
  archive = output<MfeRemoteDtoExtraProps>();
  delete = output<MfeRemoteDtoExtraProps>();

  disableUpdateButton = false;

  updateRemote() {
    this.mfeRemote.name && this.initialValue() !== this.mfeRemote
      ? this.update.emit({
          ...this.initialValue(),
          ...this.mfeRemote,
        })
      : void 0;
  }

  deleteRemote() {
    lastValueFrom(
      this.dialog
        .open(ConfirmDeleteDialog, {
          backdropClass: 'blur-backdrop',
          data: this.initialValue(),
        })
        .afterClosed()
        .pipe(
          tap((mfeRemote) => mfeRemote && this.delete.emit(mfeRemote))
        )
    );
  }

  previewMfeRemote(mfeRemote: MfeRemoteDtoExtraProps) {
    this.dialog.open(MfePreview, {
      backdropClass: 'blur-backdrop',
      data: mfeRemote,
      panelClass: ['mfe-preview', 'full-width-dialog'],
    });
  }

  openDevModeOptions(mfe: MfeRemoteDtoExtraProps) {
    this.dialog.open(DevModeOptions, {
      backdropClass: 'blur-backdrop',
      data: mfe,
      width: '600px',
    });
  }
}
