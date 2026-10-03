import { Component, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'ngx-mfe-remote-catalog-actions',
  imports: [MatButton, MatIcon],
  template: `
    <button matButton="filled" (click)="createRemote.emit()">
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
        padding: 0 1.5rem;
        background: var(--mat-sys-primary);
        backdrop-filter: blur(16px);
        box-shadow: 0 8px 24px rgba(20, 24, 40, 0.04);
      }

      @media (max-width: 700px) {
        :host {
          padding: 0 1rem;
        }
      }
    `,
  ],
})
export class MfeRemoteCatalogActions {
  createRemote = output<void>();
}
