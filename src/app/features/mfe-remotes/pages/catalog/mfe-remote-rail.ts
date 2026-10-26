import {
  NgxPanel,
  NgxButton,
} from '@tmdjr/ngx-workshop-design-system';
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
import { MfeRemoteDtoExtraProps } from '../../models/app.types';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-rail' },
  selector: 'ngx-mfe-remote-rail',
  imports: [
    NgxPanel,
    NgxButton,
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
    <ngx-panel
      heading="All remotes"
      eyebrow="CATALOG / SELECT"
      shape="chamfered"
      background="solid"
    >
      <aside aria-label="MFE remote catalog">
        <mat-form-field
          subscriptSizing="dynamic"
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
                <button
                  mat-flat-button
                  ngxButton
                  surface="outline"
                  (click)="searchChanged.emit('')"
                >
                  Clear search
                </button>
              }
            </div>
          }
        </nav>
      </aside>
    </ngx-panel>
  `,
  styles: [
    `
      :host {
        position: sticky;
        top: 128px;
        display: block;
        max-height: calc(100dvh - 144px);
        min-width: 0;
      }

      aside {
        display: flex;
        max-height: calc(100dvh - 240px);
        flex-direction: column;
      }

      .mfe-remote-rail__search-field {
        width: 100%;
        margin: 0.75rem 0 0;
      }

      .mfe-remote-rail__catalog-summary {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.35rem;
        padding: 0 0 1rem;
      }

      .mfe-remote-rail__catalog-summary span {
        display: flex;
        flex-direction: column;
        padding: 0.6rem 0.45rem;
        color: var(--ngx-color-muted);
        background: var(--ngx-color-surface);
        border-radius: var(--ngx-radius);
        font-size: 0.65rem;
        text-align: center;
      }

      .mfe-remote-rail__catalog-summary strong {
        color: var(--ngx-color-text);
        font-size: 1rem;
      }

      .mfe-remote-rail__remote-list {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        padding: 0.25rem 0.25rem 0.75rem;
        overflow-y: auto;
        scrollbar-width: thin;
      }

      .mfe-remote-rail__empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.55rem;
        padding: 2.5rem 1rem;
        color: var(--ngx-color-muted);
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

      @media (max-width: 900px) {
        :host {
          position: static;
          width: 100%;
          max-height: none;
        }
        aside {
          max-height: 480px;
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
