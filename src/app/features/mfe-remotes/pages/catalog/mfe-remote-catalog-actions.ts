import {
  ChangeDetectionStrategy,
  Component,
  output,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-catalog-actions' },
  selector: 'ngx-mfe-remote-catalog-actions',
  imports: [NgxButton, MatButton, MatIcon],
  template: `
    <h1 class="mfe-remote-catalog-actions__title">
      MFE Orchestrator
    </h1>
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

      @media (max-width: 720px) {
        :host {
          top: 76px;
        }
      }
    `,
  ],
})
export class MfeRemoteCatalogActions {
  createRemote = output<void>();
}
