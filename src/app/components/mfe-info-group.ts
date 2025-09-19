import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';

import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Component({
  selector: 'ngx-mfe-remote-info-group',
  imports: [DatePipe],
  template: `
    <div class="mfe-remote-info-group">
      <p>
        <span class="label">Last Updated:</span>
        <span class="value">{{ mfe().lastUpdated | date }}</span>
      </p>
      <p>
        <span class="label">Version:</span>
        <span class="value">{{ mfe().version }}</span>
      </p>
    </div>
  `,
  styles: [
    `
      :host {
        button {
          float: right;
          margin-left: 8px;
        }
        p {
          margin: 0.2em 0;
          display: flex;
          .label {
            font-weight: 600;
            text-align: right;
            min-width: 120px;
            margin-right: 8px;
          }
          .value {
            text-align: left;
            flex: 1;
          }
        }
      }
    `,
  ],
})
export class MfeInfoGroup {
  mfe = input.required<MfeRemoteDto>();
}
