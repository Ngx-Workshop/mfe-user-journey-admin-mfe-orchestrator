import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MfeInfoGroup } from './mfe-info-group';

import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-card-header' },
  selector: 'ngx-mfe-remote-card-header',
  imports: [MatIconButton, MatIcon, MfeInfoGroup, MatTooltip],
  template: `
    <ngx-mfe-remote-info-group
      [mfe]="initialValue()"
    ></ngx-mfe-remote-info-group>
    <div class="mfe-remote-card-header__flex-spacer"></div>
    <div class="mfe-remote-card-header__quick-actions">
      <button
        mat-icon-button
        matTooltip="Configure development mode"
        aria-label="Configure development mode"
        (click)="openDevModeOptions()"
      >
        <mat-icon>code</mat-icon>
      </button>
      <button
        mat-icon-button
        matTooltip="Preview this MFE"
        aria-label="Preview this MFE"
        (click)="previewMfeRemote()"
      >
        <mat-icon>visibility</mat-icon>
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;

        .mfe-remote-card-header__flex-spacer {
          flex: 1;
        }

        .mfe-remote-card-header__quick-actions {
          display: flex;
          gap: 0.25rem;
          padding: 0.2rem;
          background: var(--mat-sys-surface-container);
          border-radius: 12px;
        }

        @media (max-width: 520px) {
          align-items: flex-start;
          flex-direction: column;

          .mfe-remote-card-header__quick-actions {
            align-self: stretch;
            justify-content: flex-end;
          }
        }
      }
    `,
  ],
})
export class MfeRemoteCardHeader {
  initialValue = input.required<MfeRemoteDto>();
  openDevModeOutput = output<void>({ alias: 'openDevModeOptions' });
  previewOutput = output<void>({ alias: 'previewMfeRemote' });

  previewMfeRemote() {
    this.previewOutput.emit();
  }

  openDevModeOptions() {
    this.openDevModeOutput.emit();
  }
}
