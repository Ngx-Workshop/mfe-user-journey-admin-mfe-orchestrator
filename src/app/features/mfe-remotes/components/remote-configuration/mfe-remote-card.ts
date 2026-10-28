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
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import type { CreateMfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import {
  NgxButton,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
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
        [heading]="mfe.name"
        headingMotion="stagger"
        [headingMotionKey]="mfe._id"
        eyebrow="REMOTE CONFIGURATION"
        shape="stepped"
        background="grid"
        [tone]="mfe.isDevMode ? 'secondary' : 'primary'"
      >
        <div ngxPanelHeader class="mfe-remote-card__header-content">
          <ngx-mfe-remote-card-header
            [initialValue]="mfe"
            (openDevModeOptions)="openDevModeOptions(mfe)"
            (previewMfeRemote)="previewMfeRemote(mfe)"
          ></ngx-mfe-remote-card-header>
        </div>
        <!-- <ngx-mfe-remote-summary [remote]="mfe" /> -->

        <div class="mfe-remote-card__form">
          <ngx-mfe-form
            [initialValue]="initialValue()"
            [showLifecycleActions]="true"
            (autosave)="saveRemote($event)"
          >
            <div
              ngxMfeLifecycleActions
              class="mfe-remote-card__lifecycle-actions"
            >
              <button
                mat-flat-button
                ngxButton
                surface="outline"
                tone="danger"
                motion="glitch"
                type="button"
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
                type="button"
                (click)="archive.emit(mfe)"
              >
                <mat-icon>{{
                  mfe.archived ? 'unarchive' : 'archive'
                }}</mat-icon>
                {{ mfe.archived ? 'Unarchive' : 'Archive' }}
              </button>
            </div>
          </ngx-mfe-form>
        </div>
      </ngx-panel>
    }
  `,
  styles: [
    `
      ngx-panel {
        animation: panel-arrival 240ms ease-out backwards;
      }
      @keyframes panel-arrival {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        ngx-panel {
          animation: none;
        }
      }

      :host {
        display: block;
        min-width: 0;
      }
      .mfe-remote-card__header-content {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: flex-end;
        gap: var(--ngx-space-4);
        min-width: 0;
      }
      .mfe-remote-card__form {
        min-width: 0;
      }
      .mfe-remote-card__lifecycle-actions {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ngx-space-2);
      }
    `,
  ],
})
export class MfeRemoteCard {
  dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  initialValue = input.required<MfeRemoteDtoExtraProps>();

  update = output<MfeRemoteDtoExtraProps>();
  archive = output<MfeRemoteDtoExtraProps>();
  delete = output<MfeRemoteDtoExtraProps>();

  saveRemote(value: CreateMfeRemoteDto) {
    this.update.emit({ ...this.initialValue(), ...value });
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
      maxWidth: 'calc(100vw - 2rem)',
      panelClass: 'ngx-design-system-overlay',
    });
  }
}
