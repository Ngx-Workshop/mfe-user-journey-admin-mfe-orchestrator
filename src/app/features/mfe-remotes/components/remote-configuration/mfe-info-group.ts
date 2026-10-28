import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { MatTooltip } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';

import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-info-group' },
  selector: 'ngx-mfe-remote-info-group',
  imports: [DatePipe, CdkCopyToClipboard, MatTooltip],
  template: `
    <span
      #copyId
      role="button"
      tabindex="0"
      (keydown.enter)="$event.preventDefault(); copyId.click()"
      (keydown.space)="$event.preventDefault(); copyId.click()"
      class="mfe-info-group__remote-id"
      aria-label="Copy remote ID"
      [cdkCopyToClipboard]="mfe()._id"
      (cdkCopyToClipboardCopied)="
        copyStatus.set(
          $event ? 'Remote ID copied' : 'Could not copy remote ID'
        )
      "
      [matTooltip]="copyStatus() || 'Copy remote ID'"
      matTooltipClass="ngx-design-system-overlay"
    >
      ID {{ mfe()._id }}
    </span>
    <span
      class="mfe-info-group__copy-status"
      role="status"
      aria-live="polite"
      >{{ copyStatus() }}</span
    >
    <div class="mfe-info-group__mfe-remote-info-group">
      <span class="mfe-info-group__info-item">
        <span class="mfe-info-group__label">Last updated</span>
        <strong>{{ mfe().lastUpdated | date: 'mediumDate' }}</strong>
      </span>
      <span class="mfe-info-group__info-item">
        <span class="mfe-info-group__label">Version</span>
        <strong>{{ mfe().version }}</strong>
      </span>
    </div>
  `,
  styles: [
    `
      .mfe-info-group__copy-status {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      :host {
        display: block;
        min-width: 0;
        max-width: 100%;

        .mfe-info-group__remote-id {
          display: block;
          width: fit-content;
          max-width: 100%;
          cursor: pointer;
          text-underline-offset: 0.2em;
          &:hover {
            text-decoration: underline;
          }
          &:focus-visible {
            outline: 2px solid var(--ngx-color-primary);
            outline-offset: 3px;
          }
          margin-bottom: var(--ngx-space-2);
          overflow-wrap: anywhere;
          color: var(--ngx-color-muted);
          font-family: var(--ngx-font-mono);
          font-size: 0.68rem;
        }

        .mfe-info-group__mfe-remote-info-group {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem 1.5rem;
        }

        .mfe-info-group__info-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;

          .mfe-info-group__label {
            color: var(--ngx-color-muted);
            font-size: 0.66rem;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
          }

          strong {
            font-size: 0.82rem;
            font-weight: 600;
          }
        }
      }
    `,
  ],
})
export class MfeInfoGroup {
  readonly copyStatus = signal('');
  mfe = input.required<MfeRemoteDto>();
}
