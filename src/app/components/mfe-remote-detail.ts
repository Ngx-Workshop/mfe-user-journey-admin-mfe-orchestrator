import { Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { MfeRemoteDtoExtraProps } from '../app.types';
import { MfeRemoteCard } from './mfe-remote-card';

@Component({
  selector: 'ngx-mfe-remote-detail',
  imports: [MatButton, MatIcon, MfeRemoteCard],
  template: `
    <section aria-live="polite">
      @if (remote(); as selected) {
        <div class="detail-context">
          <div>
            <span class="section-label">Remote configuration</span>
            <h2>{{ selected.name }}</h2>
          </div>
          <span class="remote-id">ID {{ selected._id }}</span>
        </div>
        <ngx-mfe-remote
          [initialValue]="selected"
          (update)="update.emit($event)"
          (archive)="archive.emit($event)"
          (delete)="delete.emit($event)"
        ></ngx-mfe-remote>
      } @else {
        <div class="empty-state">
          <span class="empty-state-icon">
            <mat-icon>dns</mat-icon>
          </span>
          <h2>Your remote catalog is ready</h2>
          <p>
            Create your first MFE remote to configure and preview it
            here.
          </p>
          <button matButton="filled" (click)="createRemote.emit()">
            <mat-icon>add</mat-icon>
            Create remote
          </button>
        </div>
      }
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        padding: 1.5rem;
        background: var(--mat-sys-surface);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 20px;
        box-shadow: 0 16px 45px rgba(20, 24, 40, 0.06);
      }

      .detail-context {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        margin-bottom: 1.25rem;
        padding: 0 0.25rem;
      }

      .section-label {
        color: var(--mat-sys-primary);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      h2 {
        margin: 0.2rem 0 0;
        font-size: clamp(1.5rem, 3vw, 2rem);
        font-weight: 600;
        letter-spacing: -0.035em;
      }

      .remote-id {
        max-width: 45%;
        overflow: hidden;
        padding: 0.4rem 0.65rem;
        color: var(--mat-sys-on-surface-variant);
        background: var(--mat-sys-surface-container);
        border-radius: 8px;
        font-family: monospace;
        font-size: 0.68rem;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .empty-state {
        display: flex;
        min-height: 440px;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        text-align: center;
      }

      .empty-state-icon {
        display: grid;
        place-items: center;
        width: 72px;
        height: 72px;
        color: var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
        border-radius: 24px;
        transform: rotate(-4deg);
      }

      .empty-state mat-icon {
        width: 2rem;
        height: 2rem;
        font-size: 2rem;
      }

      .empty-state h2 {
        margin: 1.25rem 0 0.4rem;
      }

      .empty-state p {
        max-width: 390px;
        margin: 0 0 1.25rem;
        color: var(--mat-sys-on-surface-variant);
      }

      @media (max-width: 700px) {
        :host {
          width: 100%;
          padding: 1rem;
        }

        .detail-context {
          align-items: flex-start;
          flex-direction: column;
        }

        .remote-id {
          max-width: 100%;
        }
      }
    `,
  ],
})
export class MfeRemoteDetail {
  remote = input<MfeRemoteDtoExtraProps | null>(null);

  createRemote = output<void>();
  update = output<MfeRemoteDtoExtraProps>();
  archive = output<MfeRemoteDto>();
  delete = output<MfeRemoteDto>();
}
