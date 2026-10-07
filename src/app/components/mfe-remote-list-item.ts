import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MfeRemoteDtoExtraProps } from '../app.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-list-item' },
  selector: 'ngx-mfe-remote-list-item',
  imports: [MatIcon],
  template: `
    <button
      type="button"
      class="mfe-remote-list-item__remote-list-item"
      [class.mfe-remote-list-item__remote-list-item--selected]="
        selected()
      "
      [attr.aria-current]="selected() ? 'true' : null"
      (click)="remoteSelected.emit(remote()._id)"
    >
      <span
        class="mfe-remote-list-item__remote-icon"
        [class.mfe-remote-list-item__remote-icon--structural]="
          remote().type === 'structural'
        "
      >
        <mat-icon>{{
          remote().type === 'structural' ? 'account_tree' : 'web'
        }}</mat-icon>
      </span>
      <span class="mfe-remote-list-item__remote-copy">
        <span class="mfe-remote-list-item__remote-name">{{
          remote().name
        }}</span>
        <span class="mfe-remote-list-item__remote-meta">
          {{ formatType(remote().type) }}
          @if (remote().archived) {
            <span
              class="mfe-remote-list-item__status mfe-remote-list-item__status--archived"
              >Archived</span
            >
          } @else {
            <span
              class="mfe-remote-list-item__status mfe-remote-list-item__status--active"
              >Active</span
            >
          }
        </span>
      </span>
      @if (remote().isDevMode) {
        <mat-icon
          class="mfe-remote-list-item__dev-indicator"
          title="Development mode"
        >
          code
        </mat-icon>
      }
      <mat-icon class="mfe-remote-list-item__chevron"
        >chevron_right</mat-icon
      >
    </button>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .mfe-remote-list-item__remote-list-item {
        display: grid;
        grid-template-columns: 40px minmax(0, 1fr) auto auto;
        gap: 0.7rem;
        align-items: center;
        width: 100%;
        padding: 0.75rem;
        color: var(--mat-sys-on-surface);
        background: transparent;
        border: 1px solid transparent;
        border-radius: 14px;
        font: inherit;
        text-align: left;
        cursor: pointer;
        transition:
          background 160ms ease,
          border-color 160ms ease,
          transform 160ms ease;
      }

      .mfe-remote-list-item__remote-list-item:hover {
        background: var(--mat-sys-surface-container-low);
        transform: translateX(2px);
      }

      .mfe-remote-list-item__remote-list-item:focus-visible {
        outline: 3px solid
          color-mix(in srgb, var(--mat-sys-primary) 28%, transparent);
        outline-offset: 1px;
      }

      .mfe-remote-list-item__remote-list-item.mfe-remote-list-item__remote-list-item--selected {
        background: var(--mat-sys-primary-container);
        border-color: color-mix(
          in srgb,
          var(--mat-sys-primary) 24%,
          transparent
        );
      }

      .mfe-remote-list-item__remote-list-item.mfe-remote-list-item__remote-list-item--selected
        .mfe-remote-list-item__chevron {
        color: var(--mat-sys-primary);
      }

      .mfe-remote-list-item__remote-icon {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        color: var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
        border-radius: 12px;
      }

      .mfe-remote-list-item__remote-icon.mfe-remote-list-item__remote-icon--structural {
        color: var(--mat-sys-tertiary);
        background: var(--mat-sys-tertiary-container);
      }

      .mfe-remote-list-item__remote-copy {
        min-width: 0;
      }

      .mfe-remote-list-item__remote-name,
      .mfe-remote-list-item__remote-meta {
        display: block;
      }

      .mfe-remote-list-item__remote-name {
        overflow: hidden;
        font-size: 0.88rem;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .mfe-remote-list-item__remote-meta {
        margin-top: 0.25rem;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.69rem;
      }

      .mfe-remote-list-item__status {
        margin-left: 0.3rem;
      }

      .mfe-remote-list-item__status::before {
        content: '';
        display: inline-block;
        width: 5px;
        height: 5px;
        margin: 0 0.3rem 0.08rem 0;
        border-radius: 50%;
        background: currentColor;
      }

      .mfe-remote-list-item__status.mfe-remote-list-item__status--active {
        color: #247a52;
      }

      .mfe-remote-list-item__status.mfe-remote-list-item__status--archived {
        color: var(--mat-sys-on-surface-variant);
      }

      .mfe-remote-list-item__dev-indicator {
        width: 1.1rem;
        height: 1.1rem;
        color: var(--mat-sys-error);
        font-size: 1.1rem;
      }

      .mfe-remote-list-item__chevron {
        color: var(--mat-sys-outline);
      }
    `,
  ],
})
export class MfeRemoteListItem {
  remote = input.required<MfeRemoteDtoExtraProps>();
  selected = input(false);
  remoteSelected = output<string>();
  formatType(type: string) {
    return type
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
