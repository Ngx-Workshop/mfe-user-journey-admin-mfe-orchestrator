import {
  NgxButton,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { MfeRemoteDtoExtraProps } from '../../models/app.types';
import { MfeRemoteCard } from '../../components/remote-configuration/mfe-remote-card';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-detail' },
  selector: 'ngx-mfe-remote-detail',
  imports: [NgxButton, NgxPanel, MatButton, MatIcon, MfeRemoteCard],
  template: `
    <section aria-live="polite">
      @if (remote(); as selected) {
        <ngx-mfe-remote
          [initialValue]="selected"
          (update)="update.emit($event)"
          (archive)="archive.emit($event)"
          (delete)="delete.emit($event)"
        ></ngx-mfe-remote>
      } @else {
        <ngx-panel
          heading="Remote workspace"
          eyebrow="CATALOG / CONFIGURE"
          shape="stepped"
          background="grid"
        >
          <div class="mfe-remote-detail__empty-state">
            <span class="mfe-remote-detail__empty-state-icon">
              <mat-icon>dns</mat-icon>
            </span>
            @if (searchActive()) {
              <h2>No matching remote</h2>
              <p>
                Clear the search to return to your remote catalog.
              </p>
              <button
                mat-flat-button
                ngxButton
                surface="outline"
                (click)="clearSearch.emit()"
              >
                Clear search
              </button>
            } @else {
              <h2>Your remote catalog is ready</h2>
              <p>
                Create your first MFE remote to configure and preview
                it here.
              </p>
              <button
                mat-flat-button
                ngxButton
                (click)="createRemote.emit()"
              >
                <mat-icon>add</mat-icon>
                Create remote
              </button>
            }
          </div>
        </ngx-panel>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }

      h2 {
        margin: 0.2rem 0 0;
        font-size: clamp(1.1rem, 2vw, 1.4rem);
        font-weight: 600;
        letter-spacing: -0.035em;
        font-family: var(--ngx-font-mono);
        overflow-wrap: anywhere;
      }

      .mfe-remote-detail__empty-state {
        display: flex;
        min-height: 240px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        text-align: center;
      }

      .mfe-remote-detail__empty-state-icon {
        display: grid;
        place-items: center;
        width: 72px;
        height: 72px;
        color: var(--ngx-color-primary);
        background: var(--ngx-color-surface);
        border-radius: var(--ngx-radius);
        transform: rotate(-4deg);
      }

      .mfe-remote-detail__empty-state mat-icon {
        width: 2rem;
        height: 2rem;
        font-size: 2rem;
      }

      .mfe-remote-detail__empty-state h2 {
        margin: 1.25rem 0 0.4rem;
      }

      .mfe-remote-detail__empty-state p {
        max-width: 390px;
        margin: 0 0 1.25rem;
        color: var(--ngx-color-muted);
      }

      @media (max-width: 700px) {
        :host {
          width: 100%;
        }


      }
    `,
  ],
})
export class MfeRemoteDetail {
  remote = input<MfeRemoteDtoExtraProps | null>(null);
  searchActive = input(false);
  clearSearch = output<void>();

  createRemote = output<void>();
  update = output<MfeRemoteDtoExtraProps>();
  archive = output<MfeRemoteDto>();
  delete = output<MfeRemoteDto>();
}
