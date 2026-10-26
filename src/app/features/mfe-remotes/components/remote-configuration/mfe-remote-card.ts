import { MfeRemoteSummary } from './mfe-remote-summary';
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
import {
  NgxPanel,
  NgxButton,
} from '@tmdjr/ngx-workshop-design-system';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { filter } from 'rxjs';
import { MfeRemoteDtoExtraProps } from '../../models/app.types';
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
    NgxPanel,
    NgxButton,
    MatButton,
    MatIcon,
    MfeForm,
    MfeRemoteCardHeader,
  ],
  template: `
    @if (initialValue(); as mfe) {
      <ngx-panel
        heading="Configuration"
        eyebrow="REMOTE WORKSPACE"
        shape="stepped"
        background="solid"
        [tone]="mfe.isDevMode ? 'secondary' : 'primary'"
      >
        <ngx-mfe-remote-summary [remote]="mfe" />

        <div class="mfe-remote-card__metadata">
          <ngx-mfe-remote-card-header
            [initialValue]="initialValue()"
            (openDevModeOptions)="openDevModeOptions(mfe)"
            (previewMfeRemote)="previewMfeRemote(mfe)"
          ></ngx-mfe-remote-card-header>
        </div>

        <div class="mfe-remote-card__form">
          <ngx-mfe-form
            [initialValue]="initialValue()"
            (formStatus)="disableUpdateButton = $event !== 'VALID'"
            (valueChange)="mfeRemote = $event"
          ></ngx-mfe-form>
        </div>

        <div ngxPanelActions class="mfe-remote-card__actions">
          <button
            mat-flat-button
            ngxButton
            surface="outline"
            tone="danger"
            class="mfe-remote-card__delete-action"
            (click)="deleteRemote()"
          >
            <mat-icon>delete</mat-icon>
            Delete
          </button>
          <button
            mat-flat-button
            ngxButton
            surface="outline"
            tone="secondary"
            (click)="archive.emit(mfe)"
          >
            <mat-icon>{{
              mfe.archived ? 'unarchive' : 'archive'
            }}</mat-icon>
            {{ mfe.archived ? 'Unarchive' : 'Archive' }}
          </button>
          <div class="mfe-remote-card__flex-spacer"></div>
          <button
            mat-flat-button
            ngxButton
            shape="stepped"
            (click)="updateRemote()"
            [disabled]="disableUpdateButton"
          >
            <mat-icon>save</mat-icon>
            Save changes
          </button>
        </div>
      </ngx-panel>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .mfe-remote-card__form {
        min-width: 0;
      }
      .mfe-remote-card__actions {
        display: flex;
        width: 100%;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ngx-space-2);
        padding-top: var(--ngx-space-4);
        border-top: 1px solid var(--ngx-color-border);
      }
      .mfe-remote-card__flex-spacer {
        flex: 1;
      }
      @media (max-width: 600px) {
        .mfe-remote-card__flex-spacer {
          display: none;
        }
        .mfe-remote-card__actions button {
          flex: 1 1 auto;
        }
        .mfe-remote-card__actions button:last-child {
          flex-basis: 100%;
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
        backdropClass: 'ngx-design-system-backdrop',
        panelClass: 'ngx-design-system-overlay',
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
      width: '1200px',
      maxWidth: 'calc(100vw - 2rem)',
      backdropClass: 'ngx-design-system-backdrop',
      data: mfeRemote,
      panelClass: [
        'ngx-design-system-overlay',
        'orchestrator-dialog',
        'orchestrator-dialog--preview',
        'orchestrator-dialog--wide',
      ],
    });
  }

  openDevModeOptions(mfe: MfeRemoteDtoExtraProps) {
    this.dialog.open(DevModeOptions, {
      backdropClass: 'ngx-design-system-backdrop',
      data: mfe,
      width: '600px',
      panelClass: 'ngx-design-system-overlay',
    });
  }
}
