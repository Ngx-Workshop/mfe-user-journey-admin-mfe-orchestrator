import { ChangeDetectionStrategy } from '@angular/core';
import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { catchError, of } from 'rxjs';
import { MfeRemotesStore } from '../../state/mfe-remotes-store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dev-mode-options' },
  selector: 'ngx-dev-mode-options-dialog',
  imports: [
    MatButton,
    MatInput,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatSlideToggleModule,
    MatFormFieldModule,
    FormsModule,
  ],
  template: `
    <h1 mat-dialog-title>Dev Mode Options</h1>
    <mat-dialog-content>
      <p>
        Here you can configure development mode options for the MFE.
      </p>
      <mat-slide-toggle
        [disabled]="loading"
        labelPosition="before"
        [(ngModel)]="devModeEnabled"
        (ngModelChange)="devModeEnabledValueChange()"
        >Turn {{ devModeEnabled ? 'Off' : 'On' }} Dev
        Mode</mat-slide-toggle
      >
      <mat-form-field>
        <mat-label>Remote Entry Point</mat-label>
        <input
          matInput
          type="text"
          [disabled]="loading || !devModeEnabled"
          [(ngModel)]="remoteEntryPoint"
          (ngModelChange)="remoteEntryPointValueChange()"
        />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      :host {
        mat-dialog-content {
          display: flex;
          flex-direction: column;
          gap: 2.3em;
        }
      }
    `,
  ],
})
export class DevModeOptions {
  readonly dialogRef = inject(MatDialogRef<DevModeOptions>);
  readonly mfeRemote = inject<MfeRemoteDto>(MAT_DIALOG_DATA);
  private readonly destroyRef = inject(DestroyRef);
  private readonly store = inject(MfeRemotesStore);
  remoteEntryPoint = '';
  devModeEnabled = false;
  loading = true;
  private readonly changeDetector = inject(ChangeDetectorRef);

  constructor() {
    this.store
      .devModeUrl(this.mfeRemote._id)
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((value) => {
        this.devModeEnabled = !!value;
        this.remoteEntryPoint = value ?? '';
        this.loading = false;
        this.changeDetector.markForCheck();
      });
  }

  devModeEnabledValueChange() {
    this.remoteEntryPoint = this.devModeEnabled
      ? this.remoteEntryPoint ||
        'http://localhost:4201/remoteEntry.js'
      : '';
    this.persist();
  }

  remoteEntryPointValueChange() {
    if (this.devModeEnabled) this.persist();
  }

  private persist() {
    this.store.setDevMode(
      this.mfeRemote._id,
      this.devModeEnabled ? this.remoteEntryPoint : null
    );
  }
}
