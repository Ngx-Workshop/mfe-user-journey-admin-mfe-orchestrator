import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'confirm-delete' },
  selector: 'ngx-confirm-delete-dialog',
  imports: [
    NgxButton,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h2 mat-dialog-title>Delete remote?</h2>
    <mat-dialog-content>
      <p>
        Remove <strong>{{ mfeRemote.name }}</strong> from the remote
        catalog?
      </p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button
        mat-flat-button
        ngxButton
        surface="outline"
        (click)="dialogRef.close()"
      >
        Cancel
      </button>
      <button
        mat-flat-button
        ngxButton
        tone="danger"
        (click)="confirmDelete()"
      >
        Delete
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        mat-dialog-actions {
          gap: var(--ngx-space-2);
        }
        mat-dialog-content {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }
      }
    `,
  ],
})
export class ConfirmDeleteDialog {
  dialogRef = inject(MatDialogRef<ConfirmDeleteDialog>);
  mfeRemote = inject<MfeRemoteDto>(MAT_DIALOG_DATA);

  confirmDelete() {
    this.dialogRef.close(this.mfeRemote);
  }
}
