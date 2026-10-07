import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MfeRemoteDtoExtraProps } from '../../models/app.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-summary' },
  selector: 'ngx-mfe-remote-summary',
  imports: [MatIcon],
  template: `
    <div class="mfe-remote-summary__card-heading">
      <div>
        <div class="mfe-remote-summary__title-row">
          <h3>Configuration</h3>
          <span class="mfe-remote-summary__type-badge">{{
            remote().type
          }}</span>
          @if (remote().isDevMode) {
            <span class="mfe-remote-summary__dev-badge">
              <mat-icon>code</mat-icon>
              Dev mode
            </span>
          }
        </div>
        <p>
          {{ remote().description || 'No description provided.' }}
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .mfe-remote-summary__card-heading {
        display: flex;
        justify-content: space-between;
        gap: 1rem;
        padding: 1.25rem 1.25rem 1rem;
        background: var(--mat-sys-surface);
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      .mfe-remote-summary__title-row {
        display: flex;
        flex-wrap: wrap;
        gap: 0.55rem;
        align-items: center;
      }

      .mfe-remote-summary__card-heading h3 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: 600;
      }

      .mfe-remote-summary__card-heading p {
        max-width: 720px;
        margin: 0.45rem 0 0;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.85rem;
        line-height: 1.5;
      }

      .mfe-remote-summary__type-badge,
      .mfe-remote-summary__dev-badge {
        display: inline-flex;
        align-items: center;
        padding: 0.25rem 0.55rem;
        border-radius: 999px;
        font-size: 0.68rem;
        font-weight: 600;
        text-transform: capitalize;
      }

      .mfe-remote-summary__type-badge {
        color: var(--mat-sys-on-secondary-container);
        background: var(--mat-sys-secondary-container);
      }

      .mfe-remote-summary__dev-badge {
        gap: 0.25rem;
        color: var(--mat-sys-on-error-container);
        background: var(--mat-sys-error-container);
      }

      .mfe-remote-summary__dev-badge mat-icon {
        width: 0.9rem;
        height: 0.9rem;
        font-size: 0.9rem;
      }
    `,
  ],
})
export class MfeRemoteSummary {
  remote = input.required<MfeRemoteDtoExtraProps>();
}
