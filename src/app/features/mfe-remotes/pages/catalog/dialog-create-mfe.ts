import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MfeForm } from '../../components/remote-configuration/form-mfe/form-mfe';

import type { CreateMfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'create-mfe' },
  selector: 'ngx-create-mfe-dialog',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MfeForm,
  ],
  template: `
    <div>
      <h2 mat-dialog-title>Create MFE Remote catalog entry?</h2>
      <mat-dialog-content>
        <ngx-mfe-form
          (formStatus)="disableCreateButton = $event !== 'VALID'"
          (valueChange)="mfeRemote = $event"
        ></ngx-mfe-form>
      </mat-dialog-content>
      <mat-dialog-actions>
        <button matButton (click)="dialogRef.close()">Cancel</button>
        <button
          matButton
          (click)="dialogRef.close(this.mfeRemote)"
          [disabled]="disableCreateButton"
        >
          Create
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      :host {
        mat-dialog-content {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
        }
      }
    `,
  ],
})
export class CreateMFEDialog {
  dialogRef = inject(MatDialogRef<CreateMFEDialog>);
  disableCreateButton = true;
  mfeRemote: CreateMfeRemoteDto = {
    name: '',
    remoteEntryUrl: '',
    type: 'user-journey',
  };
}
