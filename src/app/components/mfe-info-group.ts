import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-info-group' },
  selector: 'ngx-mfe-remote-info-group',
  imports: [DatePipe],
  template: `
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
      :host {
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
            color: var(--mat-sys-on-surface-variant);
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
  mfe = input.required<MfeRemoteDto>();
}
