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
    <button
      mat-flat-button
      ngxButton
      shape="beveled"
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
        top: 56px;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        min-height: 64px;
        width: min(100% - 3rem, 1440px);
        margin: 0 auto;
        padding: 0.5rem 0;
        border-block: 1px solid var(--ngx-color-border);
        background: color-mix(
          in srgb,
          var(--ngx-color-canvas) 92%,
          transparent
        );
        backdrop-filter: blur(16px);
      }

      @media (max-width: 900px) {
        :host {
          width: calc(100% - 2rem);
        }
      }
    `,
  ],
})
export class MfeRemoteCatalogActions {
  createRemote = output<void>();
}
