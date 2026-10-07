import { MfeRemoteListItem } from './mfe-remote-list-item';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatPrefix,
  MatFormField,
  MatLabel,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MfeRemoteDtoExtraProps } from '../app.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-rail' },
  selector: 'ngx-mfe-remote-rail',
  imports: [
    MfeRemoteListItem,
    MatButton,
    MatPrefix,
    MatFormField,
    MatIcon,
    MatIconButton,
    MatInput,
    MatLabel,
    MatSuffix,
  ],
  template: `
    <aside aria-label="MFE remote catalog">
      <div class="mfe-remote-rail__rail-heading">
        <div>
          <span class="mfe-remote-rail__section-label">Catalog</span>
          <h2>All remotes</h2>
        </div>
        <span class="mfe-remote-rail__count-badge">{{
          remotes().length
        }}</span>
      </div>

      <mat-form-field
        appearance="outline"
        class="mfe-remote-rail__search-field"
      >
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

      <div
        class="mfe-remote-rail__catalog-summary"
        aria-label="Catalog summary"
      >
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

      <nav
        class="mfe-remote-rail__remote-list"
        aria-label="Available MFE remotes"
      >
        @for (remote of remotes(); track remote._id) {
          <ngx-mfe-remote-list-item
            [remote]="remote"
            [selected]="selectedRemoteId() === remote._id"
            (remoteSelected)="remoteSelected.emit($event)"
          />
        } @empty {
          <div class="mfe-remote-rail__empty-state">
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

      .mfe-remote-rail__rail-heading {
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

      .mfe-remote-rail__section-label {
        color: var(--mat-sys-primary);
        font-size: 0.68rem;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }

      .mfe-remote-rail__count-badge {
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

      .mfe-remote-rail__search-field {
        width: calc(100% - 2rem);
        margin: 0.35rem 1rem 0;
      }

      .mfe-remote-rail__catalog-summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.35rem;
        padding: 0 1rem 1rem;
      }

      .mfe-remote-rail__catalog-summary span {
        display: flex;
        flex-direction: column;
        padding: 0.6rem 0.45rem;
        color: var(--mat-sys-on-surface-variant);
        background: var(--mat-sys-surface-container-low);
        border-radius: 10px;
        font-size: 0.65rem;
        text-align: center;
      }

      .mfe-remote-rail__catalog-summary strong {
        color: var(--mat-sys-on-surface);
        font-size: 1rem;
      }

      .mfe-remote-rail__remote-list {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        padding: 0 0.65rem 0.75rem;
        overflow-y: auto;
        scrollbar-width: thin;
      }

      .mfe-remote-rail__empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.55rem;
        padding: 2.5rem 1rem;
        color: var(--mat-sys-on-surface-variant);
        text-align: center;
      }

      .mfe-remote-rail__empty-state mat-icon {
        width: 2rem;
        height: 2rem;
        font-size: 2rem;
      }

      .mfe-remote-rail__empty-state span {
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
}
