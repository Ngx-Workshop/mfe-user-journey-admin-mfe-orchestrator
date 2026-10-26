import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { NgxStatus } from '@tmdjr/ngx-workshop-design-system';
import { MfeRemoteDtoExtraProps } from '../../models/app.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-summary' },
  selector: 'ngx-mfe-remote-summary',
  imports: [NgxStatus],
  template: `
    <div
      class="mfe-remote-summary__statuses"
      aria-label="Remote status"
    >
      <ngx-status
        [label]="remote().archived ? 'Archived' : 'Active'"
        [tone]="remote().archived ? 'warning' : 'success'"
      />
      <ngx-status
        [label]="
          remote().type === 'structural'
            ? 'Structural'
            : 'User journey'
        "
        tone="info"
      />
      @if (remote().isDevMode) {
        <ngx-status label="Dev mode" tone="warning" />
      }
    </div>
    <p class="mfe-remote-summary__description">
      {{ remote().description || 'No description provided.' }}
    </p>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .mfe-remote-summary__statuses {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ngx-space-2);
      }
      .mfe-remote-summary__description {
        margin: var(--ngx-space-2) 0 var(--ngx-space-6);
        color: var(--ngx-color-muted);
        line-height: 1.6;
        overflow-wrap: anywhere;
      }
    `,
  ],
})
export class MfeRemoteSummary {
  remote = input.required<MfeRemoteDtoExtraProps>();
}
