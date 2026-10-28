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

import type { MfeRemoteDtoExtraProps } from '../../models/app.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-card-header' },
  selector: 'ngx-mfe-remote-card-header',
  imports: [MatIconButton, MatIcon, MfeInfoGroup, MatTooltip],
  template: `
    <ngx-mfe-remote-info-group
      [mfe]="initialValue()"
    ></ngx-mfe-remote-info-group>
    <div class="mfe-remote-card-header__quick-actions">
      <button
        mat-icon-button
        matTooltipClass="ngx-design-system-overlay"
        matTooltip="Configure development mode"
        aria-label="Configure development mode"
        type="button"
        [class.mfe-remote-card-header__dev-mode--active]="
          initialValue().isDevMode
        "
        (click)="openDevModeOptions()"
      >
        <mat-icon>code</mat-icon>
      </button>
      <button
        mat-icon-button
        matTooltipClass="ngx-design-system-overlay"
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
      .mfe-remote-card-header__dev-mode--active {
        color: var(--ngx-color-warning);
        box-shadow:
          0 0 0 1px
            color-mix(
              in srgb,
              var(--ngx-color-warning) 50%,
              transparent
            ),
          0 0 16px
            color-mix(
              in srgb,
              var(--ngx-color-warning) 45%,
              transparent
            );
      }
      :host {
        min-width: 0;
        max-width: 100%;
        flex-wrap: wrap;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;

        .mfe-remote-card-header__quick-actions {
          display: flex;
          gap: 0.25rem;
          padding: 0.2rem;
          background: var(--ngx-color-surface);
          border-radius: var(--ngx-radius);
        }
      }
    `,
  ],
})
export class MfeRemoteCardHeader {
  initialValue = input.required<MfeRemoteDtoExtraProps>();
  openDevModeOutput = output<void>({ alias: 'openDevModeOptions' });
  previewOutput = output<void>({ alias: 'previewMfeRemote' });

  previewMfeRemote() {
    this.previewOutput.emit();
  }

  openDevModeOptions() {
    this.openDevModeOutput.emit();
  }
}
