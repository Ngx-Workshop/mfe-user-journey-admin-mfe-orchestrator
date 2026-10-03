import { Component, input, output } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MfeRemoteDtoExtraProps } from '../app.types';

@Component({
  selector: 'ngx-mfe-remote-rail',
  imports: [
    MatButton,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
  ],
  template: `
    <aside aria-label="MFE remote catalog">
      <div class="rail-heading">
        <div>
          <span class="section-label">Catalog</span>
          <h2>All remotes</h2>
        </div>
        <span class="count-badge">{{ remotes().length }}</span>
      </div>

      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search remotes</mat-label>
        <input
          matInput
          type="search"
          placeholder="Name, URL, type..."
          [value]="searchTerm()"
          (input)="searchChanged.emit($any($event.target).value)"
        />
        <mat-icon matPrefix>search</mat-icon>
        @if (searchTerm()) {
        <button
          matSuffix
          mat-icon-button
          type="button"
          aria-label="Clear search"
          (click)="searchChanged.emit('')"
        >
          <mat-icon>close</mat-icon>
        </button>
        }
      </mat-form-field>

      <div class="catalog-summary" aria-label="Catalog summary">
        <span>
          <strong>{{ activeCount() }}</strong>
          Active
        </span>
        <span>
          <strong>{{ devModeCount() }}</strong>
          Dev mode
        </span>
        <span>
          <strong>{{ archivedCount() }}</strong>
          Archived
        </span>
      </div>

      <nav class="remote-list" aria-label="Available MFE remotes">
        @for (remote of remotes(); track remote._id) {
        <button
          type="button"
          class="remote-list-item"
          [class.selected]="selectedRemoteId() === remote._id"
          (click)="remoteSelected.emit(remote._id)"
        >
          <span
            class="remote-icon"
            [class.structural]="remote.type === 'structural'"
          >
            <mat-icon>{{
              remote.type === 'structural' ? 'account_tree' : 'web'
            }}</mat-icon>
          </span>
          <span class="remote-copy">
            <span class="remote-name">{{ remote.name }}</span>
            <span class="remote-meta">
              {{ formatType(remote.type) }}
              @if (remote.archived) {
              <span class="status archived">Archived</span>
              } @else {
              <span class="status active">Active</span>
              }
            </span>
          </span>
          @if (remote.isDevMode) {
          <mat-icon class="dev-indicator" title="Development mode">
            code
          </mat-icon>
          }
          <mat-icon class="chevron">chevron_right</mat-icon>
        </button>
        } @empty {
        <div class="empty-state">
          <mat-icon>search_off</mat-icon>
          <strong>No remotes found</strong>
          <span>Try a different name, URL, type, or status.</span>
          @if (searchTerm()) {
          <button matButton (click)="searchChanged.emit('')">
            Clear search
          </button>
          }
        </div>
        }
      </nav>
    </aside>
  `,
  styles: [
    `
      :host {
        position: sticky;
        top: 126px;
        display: block;
        max-height: calc(100vh - 134px);
        overflow: hidden;
        background: var(--mat-sys-surface);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 20px;
      }

      aside {
        display: flex;
        max-height: inherit;
        flex-direction: column;
      }

      .rail-heading {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.35rem 1.35rem 0.8rem;
      }

      h2 {
        margin: 0.15rem 0 0;
        font-size: 1.35rem;
        font-weight: 600;
        letter-spacing: -0.02em;
      }

      .section-label {
        color: var(--mat-sys-primary);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .count-badge {
        display: grid;
        place-items: center;
        min-width: 2rem;
        height: 2rem;
        padding: 0 0.5rem;
        color: var(--mat-sys-on-secondary-container);
        background: var(--mat-sys-secondary-container);
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 700;
      }

      .search-field {
        width: calc(100% - 2rem);
        margin: 0.35rem 1rem 0;
      }

      .catalog-summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.35rem;
        padding: 0 1rem 1rem;
      }

      .catalog-summary span {
        display: flex;
        flex-direction: column;
        padding: 0.6rem 0.45rem;
        color: var(--mat-sys-on-surface-variant);
        background: var(--mat-sys-surface-container-low);
        border-radius: 10px;
        font-size: 0.65rem;
        text-align: center;
      }

      .catalog-summary strong {
        color: var(--mat-sys-on-surface);
        font-size: 1rem;
      }

      .remote-list {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        padding: 0 0.65rem 0.75rem;
        overflow-y: auto;
        scrollbar-width: thin;
      }

      .remote-list-item {
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
        transition: background 160ms ease, border-color 160ms ease,
          transform 160ms ease;
      }

      .remote-list-item:hover {
        background: var(--mat-sys-surface-container-low);
        transform: translateX(2px);
      }

      .remote-list-item:focus-visible {
        outline: 3px solid
          color-mix(in srgb, var(--mat-sys-primary) 28%, transparent);
        outline-offset: 1px;
      }

      .remote-list-item.selected {
        background: var(--mat-sys-primary-container);
        border-color: color-mix(
          in srgb,
          var(--mat-sys-primary) 24%,
          transparent
        );
      }

      .remote-list-item.selected .chevron {
        color: var(--mat-sys-primary);
      }

      .remote-icon {
        display: grid;
        place-items: center;
        width: 40px;
        height: 40px;
        color: var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
        border-radius: 12px;
      }

      .remote-icon.structural {
        color: var(--mat-sys-tertiary);
        background: var(--mat-sys-tertiary-container);
      }

      .remote-copy {
        min-width: 0;
      }

      .remote-name,
      .remote-meta {
        display: block;
      }

      .remote-name {
        overflow: hidden;
        font-size: 0.88rem;
        font-weight: 600;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .remote-meta {
        margin-top: 0.25rem;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.69rem;
      }

      .status {
        margin-left: 0.3rem;
      }

      .status::before {
        content: '';
        display: inline-block;
        width: 5px;
        height: 5px;
        margin: 0 0.3rem 0.08rem 0;
        border-radius: 50%;
        background: currentColor;
      }

      .status.active {
        color: #247a52;
      }

      .status.archived {
        color: var(--mat-sys-on-surface-variant);
      }

      .dev-indicator {
        width: 1.1rem;
        height: 1.1rem;
        color: var(--mat-sys-error);
        font-size: 1.1rem;
      }

      .chevron {
        color: var(--mat-sys-outline);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.55rem;
        padding: 2.5rem 1rem;
        color: var(--mat-sys-on-surface-variant);
        text-align: center;
      }

      .empty-state mat-icon {
        width: 2rem;
        height: 2rem;
        font-size: 2rem;
      }

      .empty-state span {
        font-size: 0.78rem;
      }

      @media (max-width: 700px) {
        :host {
          position: static;
          width: 100%;
          max-height: 440px;
        }
      }
    `,
  ],
})
export class MfeRemoteRail {
  remotes = input.required<MfeRemoteDtoExtraProps[]>();
  selectedRemoteId = input<string | null>(null);
  searchTerm = input('');
  activeCount = input(0);
  archivedCount = input(0);
  devModeCount = input(0);

  remoteSelected = output<string>();
  searchChanged = output<string>();

  formatType(type: string) {
    return type
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
