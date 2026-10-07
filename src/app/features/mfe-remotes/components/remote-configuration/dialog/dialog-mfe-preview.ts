import { loadRemoteModule } from '@angular-architects/module-federation';
import {
  ChangeDetectionStrategy,
  Component,
  ViewChild,
  ViewContainerRef,
  inject,
  DestroyRef,
  signal,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-preview' },
  selector: 'ngx-mfe-preview',
  imports: [
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
  ],
  template: `
    <h2 mat-dialog-title>You Are Previewing: {{ mfeRemote.name }}</h2>
    <mat-dialog-content>
      @if (error()) {
        <p role="alert">{{ error() }}</p>
      }
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

  dialogRef = inject(MatDialogRef<MfePreview>);
  mfeRemote = inject<MfeRemoteDto>(MAT_DIALOG_DATA);

  readonly error = signal<string | null>(null);
  private readonly destroyRef = inject(DestroyRef);

  async ngOnInit() {
    try {
      const remote = await loadRemoteModule({
        type: 'module',
        remoteEntry: this.mfeRemote.remoteEntryUrl,
        exposedModule: './Component',
      });
      if (!this.destroyRef.destroyed)
        this.mfeHost.createComponent(remote.default);
    } catch (error) {
      this.error.set(
        'This remote could not be loaded. Check its entry URL and try again.'
      );
    }
  }
}
