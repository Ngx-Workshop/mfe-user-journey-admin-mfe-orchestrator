import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { SaveNotification } from '../../models/save-notification';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-catalog-actions' },
  selector: 'ngx-mfe-remote-catalog-actions',
  imports: [NgxButton, MatButton, MatIcon],
  template: `
    <h1 class="mfe-remote-catalog-actions__title">
      MFE Orchestrator
    </h1>
    <div
      class="mfe-remote-catalog-actions__dev-mode"
      [class.mfe-remote-catalog-actions__dev-mode--active]="
        devModeCount() > 0
      "
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <span
        class="mfe-remote-catalog-actions__dev-light"
        aria-hidden="true"
      ></span>
      <span
        ><strong>{{ devModeCount() }}</strong>
        {{ devModeCount() === 1 ? 'MFE' : 'MFEs' }} in dev mode</span
      >
    </div>
    <div
      class="mfe-remote-catalog-actions__save"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      @if (saveNotification(); as notification) { @switch
      (notification.status) { @case ('saving') {
      <span>Saving {{ notification.name }}…</span>
      } @case ('saved') {
      <span class="mfe-remote-catalog-actions__saved"
        >Changes saved · {{ notification.name }}</span
      >
      } @case ('error') {
      <span class="mfe-remote-catalog-actions__save-error"
        >Could not save {{ notification.name }}.</span
      >
      <button
        mat-flat-button
        ngxButton
        surface="outline"
        tone="danger"
        type="button"
        (click)="retrySave.emit()"
      >
        Retry save
      </button>
      } } }
    </div>

    <button
      mat-flat-button
      ngxButton
      shape="chevron"
      surface="outline"
      (click)="createRemote.emit()"
    >
      <mat-icon>add</mat-icon>
      New remote
    </button>
  `,
  styles: [
    `
      :host {
        position: sticky;
        top: 96px;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--ngx-space-4);
        flex-wrap: wrap;
        box-sizing: border-box;
        min-height: 56px;
        width: 100%;
        margin: 0;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid var(--ngx-color-border);
        background: color-mix(
          in srgb,
          var(--ngx-color-canvas) 75%,
          transparent
        );
        backdrop-filter: blur(16px);
      }

      .mfe-remote-catalog-actions__title {
        margin: 0;
        font-family: var(--ngx-font-mono);
        font-size: 1rem;
        line-height: 1.4;
        overflow-wrap: anywhere;
      }

      .mfe-remote-catalog-actions__save {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ngx-space-2);
        flex: 1;
        min-width: 0;
        overflow-wrap: anywhere;
        color: var(--ngx-color-muted);
        font-size: 0.8rem;
      }
      .mfe-remote-catalog-actions__saved {
        color: var(--ngx-color-success);
      }
      .mfe-remote-catalog-actions__save-error {
        color: var(--ngx-color-error);
      }
      .mfe-remote-catalog-actions__dev-mode {
        display: flex;
        align-items: center;
        gap: var(--ngx-space-2);
        color: var(--ngx-color-muted);
        font-family: var(--ngx-font-mono);
        font-size: 0.5rem;
      }
      .mfe-remote-catalog-actions__dev-light {
        flex: 0 0 0.5rem;
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 50%;
        background: var(--ngx-color-border);
      }
      .mfe-remote-catalog-actions__dev-mode--active {
        color: var(--ngx-color-warning);
      }
      .mfe-remote-catalog-actions__dev-mode--active
        .mfe-remote-catalog-actions__dev-light {
        background: var(--ngx-color-warning);
        box-shadow: 0 0 0.5rem
          color-mix(
            in srgb,
            var(--ngx-color-warning) 50%,
            transparent
          );
      }
      @media (max-width: 720px) {
        :host {
          top: 76px;
        }
      }
    `,
  ],
})
export class MfeRemoteCatalogActions {
  readonly devModeCount = input(0);
  readonly saveNotification = input<SaveNotification>(null);
  readonly retrySave = output<void>();
  createRemote = output<void>();
}
