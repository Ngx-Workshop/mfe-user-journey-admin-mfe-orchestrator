import { Component, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { MfeInfoGroup } from './mfe-info-group';

import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Component({
  selector: 'ngx-mfe-remote-card-header',
  imports: [MatIconButton, MatIcon, MfeInfoGroup, MatTooltip],
  template: `
    <button mat-icon-button matTooltip="Hello I'm some info">
      <mat-icon>info</mat-icon>
    </button>
    <button mat-icon-button (click)="openDevModeOptions()">
      <mat-icon>code</mat-icon>
    </button>
    <button
      mat-icon-button
      matTooltip="Preview the MFE"
      (click)="previewMfeRemote()"
    >
      <mat-icon>visibility</mat-icon>
    </button>
    <div class="flex-spacer"></div>
    <ngx-mfe-remote-info-group
      [mfe]="initialValue()"
    ></ngx-mfe-remote-info-group>
  `,
  styles: [
    `
      :host {
        width: 100%;
        display: flex;
        flex-direction: row;
        margin-bottom: 1em;
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
