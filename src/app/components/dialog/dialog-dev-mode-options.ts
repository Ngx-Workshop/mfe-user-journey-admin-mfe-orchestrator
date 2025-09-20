import { Component, inject } from '@angular/core';
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
import { LocalStorageBrokerService } from '@tmdjr/ngx-local-storage-client';

@Component({
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
          [disabled]="!devModeEnabled"
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
  dialogRef = inject(MatDialogRef<DevModeOptions>);
  mfeRemote = inject(MAT_DIALOG_DATA);
  localStorageBrokerService = inject(LocalStorageBrokerService);

  remoteEntryPoint!: string;
  devModeEnabled = false;

  constructor() {
    this.localStorageBrokerService
      .getItem(this.mfeRemote._id)
      .then((value) => {
        if (value) {
          this.devModeEnabled = true;
          this.remoteEntryPoint = value;
        }
      });
  }

  devModeEnabledValueChange() {
    if (this.devModeEnabled) {
      if (!this.remoteEntryPoint) {
        this.remoteEntryPoint =
          'http://localhost:4201/remoteEntry.js';
        localStorage.setItem(
          `mfe-remotes:${this.mfeRemote._id}`,
          this.remoteEntryPoint
        );
        this.localStorageBrokerService.setItem(
          this.mfeRemote._id,
          this.remoteEntryPoint
        );
      }
    } else {
      localStorage.removeItem(`mfe-remotes:${this.mfeRemote._id}`);
      this.localStorageBrokerService.removeItem(this.mfeRemote._id);
      this.remoteEntryPoint = '';
    }
  }

  remoteEntryPointValueChange() {
    if (!this.devModeEnabled) return;

    const localStorageKey = `mfe-remotes:${this.mfeRemote._id}`;
    localStorage.setItem(localStorageKey, this.remoteEntryPoint);
    this.localStorageBrokerService.setItem(
      localStorageKey,
      this.remoteEntryPoint
    );
  }
}
