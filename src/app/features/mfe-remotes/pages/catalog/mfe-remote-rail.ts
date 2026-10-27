import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import {
  MatFormField,
  MatLabel,
  MatPrefix,
  MatSuffix,
} from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import {
  NgxButton,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import { MfeRemoteDtoExtraProps } from '../../models/app.types';
import { MfeRemoteListItem } from './mfe-remote-list-item';

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
      <aside
        #catalogBody
        aria-label="MFE remote catalog"
        [style.max-height.px]="bodyHeight()"
      >
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
        top: 182px;
        display: block;
        min-width: 0;
      }

      aside {
        display: flex;
        min-height: 0;
        overflow-y: auto;
        scrollbar-width: thin;
        flex-direction: column;
      }

      .mfe-remote-rail__search-field,
      .mfe-remote-rail__catalog-summary {
        flex-shrink: 0;
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
        min-height: 0;
        overflow-y: auto;
        scrollbar-width: thin;
      }

      .mfe-remote-rail__remote-list > * {
        flex-shrink: 0;
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
      }
    `,
  ],
})
export class MfeRemoteRail {
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly catalogBody = viewChild.required<ElementRef<HTMLElement>>('catalogBody');
  readonly bodyHeight = signal<number | null>(null);

  constructor() {
    afterNextRender(() => {
      const host = this.element.nativeElement;
      const body = this.catalogBody().nativeElement;
      const viewport = host.ownerDocument.defaultView!;
      let frame = 0;
      const measure = () => {
        const bounds = host.getBoundingClientRect();
        // Measure panel chrome rather than assuming a fixed theme/header height.
        const chrome = bounds.height - body.getBoundingClientRect().height;
        const available = viewport.innerHeight - bounds.top - chrome - 16;
        const height = Math.max(0, Math.floor(available));
        this.bodyHeight.set(viewport.innerWidth <= 900 ? Math.min(480, height) : height);
      };
      const schedule = () => {
        viewport.cancelAnimationFrame(frame);
        frame = viewport.requestAnimationFrame(measure);
      };
      const observer = new ResizeObserver(schedule);
      observer.observe(host);
      observer.observe(body);
      viewport.addEventListener('resize', schedule);
      viewport.addEventListener('scroll', schedule, { capture: true, passive: true });
      measure();
      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        viewport.cancelAnimationFrame(frame);
        viewport.removeEventListener('resize', schedule);
        viewport.removeEventListener('scroll', schedule, true);
      });
    });
  }

  remotes = input.required<MfeRemoteDtoExtraProps[]>();
  selectedRemoteId = input<string | null>(null);
  searchTerm = input('');
  activeCount = input(0);
  archivedCount = input(0);
  devModeCount = input(0);

  remoteSelected = output<string>();
  searchChanged = output<string>();
}
