import { MfeRemoteSummary } from './mfe-remote-summary';
import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { filter } from 'rxjs';
import { MfeRemoteDtoExtraProps } from '../app.types';
import { ConfirmDeleteDialog } from './dialog/dialog-confirm-delete';
import { DevModeOptions } from './dialog/dialog-dev-mode-options';
import { MfePreview } from './dialog/dialog-mfe-preview';
import { MfeForm } from './form-mfe/form-mfe';
import { MfeRemoteCardHeader } from './mfe-remote-card-header';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-card' },
  selector: 'ngx-mfe-remote',
  imports: [
    MfeRemoteSummary,
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
        class="mfe-remote-card__card"
        appearance="filled"
        [ngClass]="{
          'mfe-remote-card__card--dev-mode': mfe.isDevMode,
        }"
      >
        <ngx-mfe-remote-summary [remote]="mfe" />

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
            class="mfe-remote-card__delete-action"
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
          <div class="mfe-remote-card__flex-spacer"></div>
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

      .mfe-remote-card__delete-action {
        color: var(--mat-sys-error);
      }

      .mfe-remote-card__flex-spacer {
        flex: 1;
      }

      .mfe-remote-card__card--dev-mode {
        border-color: color-mix(
          in srgb,
          var(--mat-sys-error) 48%,
          var(--mat-sys-outline-variant)
        );
        box-shadow: 0 0 0 3px
          color-mix(in srgb, var(--mat-sys-error) 8%, transparent);
      }

      @media (max-width: 600px) {
        mat-card-actions .mfe-remote-card__flex-spacer {
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
  private readonly destroyRef = inject(DestroyRef);
  initialValue = input.required<MfeRemoteDtoExtraProps>();

  mfeRemote: Partial<MfeRemoteDtoExtraProps> = {};

  update = output<MfeRemoteDtoExtraProps>();
  archive = output<MfeRemoteDtoExtraProps>();
  delete = output<MfeRemoteDtoExtraProps>();

  disableUpdateButton = true;

  updateRemote() {
    if (this.disableUpdateButton) return;
    this.update.emit({ ...this.initialValue(), ...this.mfeRemote });
  }

  deleteRemote() {
    this.dialog
      .open<
        ConfirmDeleteDialog,
        MfeRemoteDtoExtraProps,
        MfeRemoteDtoExtraProps
      >(ConfirmDeleteDialog, {
        backdropClass: 'blur-backdrop',
        data: this.initialValue(),
      })
      .afterClosed()
      .pipe(
        filter(
          (remote): remote is MfeRemoteDtoExtraProps => !!remote
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((remote) => this.delete.emit(remote));
  }

  previewMfeRemote(mfeRemote: MfeRemoteDtoExtraProps) {
    this.dialog.open(MfePreview, {
      backdropClass: 'blur-backdrop',
      data: mfeRemote,
      panelClass: [
        'orchestrator-dialog',
        'orchestrator-dialog--preview',
        'orchestrator-dialog--wide',
      ],
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
