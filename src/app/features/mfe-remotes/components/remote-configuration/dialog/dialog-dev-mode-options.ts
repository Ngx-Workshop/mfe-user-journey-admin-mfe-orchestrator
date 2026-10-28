import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
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
import { MfeRemotesStore } from '../../../state/mfe-remotes-store';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'dev-mode-options' },
  selector: 'ngx-dev-mode-options-dialog',
  imports: [
    NgxButton,
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
    <h2 mat-dialog-title>Development override</h2>
    <mat-dialog-content>
      <p>
        Use a local entry point for {{ mfeRemote.name }} in this
        browser. The deployed catalog entry stays unchanged.
      </p>
      <div class="dev-mode-options__override-row">
        <mat-slide-toggle
          class="dev-mode-options__toggle"
          aria-label="Development mode"
          [disabled]="loading"
          labelPosition="before"
          [(ngModel)]="devModeEnabled"
          (ngModelChange)="devModeEnabledValueChange()"
          >Dev mode</mat-slide-toggle
        >
        <mat-form-field
          subscriptSizing="dynamic"
          appearance="outline"
        >
          <mat-label>Remote Entry Point</mat-label>
          <input
            matInput
            type="text"
            [disabled]="loading || !devModeEnabled"
            [(ngModel)]="remoteEntryPoint"
            (ngModelChange)="remoteEntryPointValueChange()"
          />
        </mat-form-field>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button
        mat-flat-button
        ngxButton
        surface="outline"
        (click)="dialogRef.close()"
      >
        Close
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      @use '@tmdjr/ngx-workshop-design-system/theme' as ngx;

      .dev-mode-options__override-row {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr);
        align-items: center;
        gap: var(--ngx-space-4);
        margin-top: var(--ngx-space-4);
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
      }
      .dev-mode-options__toggle {
        @include ngx.warning-slide-toggle();
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
