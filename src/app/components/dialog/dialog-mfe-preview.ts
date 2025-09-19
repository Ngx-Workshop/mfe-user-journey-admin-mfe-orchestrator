import { loadRemoteModule } from '@angular-architects/module-federation';
import { Component, ViewChild, ViewContainerRef, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { ConfirmDeleteDialog } from './dialog-confirm-delete';

@Component({
  selector: 'ngx-mfe-preview',
  imports: [MatButton, MatDialogTitle, MatDialogContent, MatDialogActions],
  template: `
    <h2 mat-dialog-title>You Are Previewing: {{ mfeRemote.name }}</h2>
    <mat-dialog-content>
      <ng-container #mfeHost></ng-container>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button matButton (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      h2,
      mat-dialog-actions {
        background: var(--mat-sys-secondary-container);
      }
    `,
  ],
})
export class MfePreview {
  @ViewChild('mfeHost', { read: ViewContainerRef, static: true })
  private mfeHost!: ViewContainerRef;

  dialogRef = inject(MatDialogRef<ConfirmDeleteDialog>);
  mfeRemote = inject<MfeRemoteDto>(MAT_DIALOG_DATA);

  async ngOnInit() {
    try {
      const remote = await loadRemoteModule({
        type: 'module',
        remoteEntry: this.mfeRemote.remoteEntryUrl,
        exposedModule: './Component',
      });
      this.mfeHost.createComponent(remote.default);
    } catch (error) {
      console.error('[MFE LOAD ERROR]', error);
    }
  }
}
