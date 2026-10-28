import { AsyncPipe } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogViewModel } from './catalog-view-model';
import { CreateMfePage } from './create-mfe-page';
import { MfeRemoteCatalogActions } from './mfe-remote-catalog-actions';
import { MfeRemoteDetail } from './mfe-remote-detail';
import { MfeRemoteRail } from './mfe-remote-rail';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'list-mfe-remotes ngx-design-system',
    '[class.list-mfe-remotes--creation]': 'model.creating',
  },
  selector: 'ngx-mfe-remotes',
  providers: [CatalogViewModel],
  imports: [
    AsyncPipe,
    MatButton,
    MatProgressBar,
    NgxButton,
    MfeRemoteCatalogActions,
    MfeRemoteDetail,
    MfeRemoteRail,
    CreateMfePage,
  ],
  template: `
    <ngx-mfe-remote-catalog-actions
      [creating]="model.creating"
      (backToList)="backToList()"
      [devModeCount]="model.viewModel().devModeCount"
      [saveNotification]="model.store.saveNotification$ | async"
      (retrySave)="model.store.retryUpdate()"
      (createRemote)="createRemote()"
    ></ngx-mfe-remote-catalog-actions>

    @if (model.viewModel(); as vm) {
      @if (vm.showProgress) {
        <mat-progress-bar
          class="catalog__progress"
          mode="indeterminate"
          [attr.aria-label]="
            vm.loaded ? 'Refreshing remotes' : 'Loading remotes'
          "
        />
      }
      @if (vm.error) {
        <div class="catalog__error" role="alert">
          {{ vm.error }}
          <button
            mat-flat-button
            ngxButton
            surface="outline"
            tone="danger"
            type="button"
            (click)="model.store.refresh()"
            [disabled]="vm.busy"
          >
            Retry
          </button>
        </div>
      }

      @if (!model.creating && !vm.loaded && !vm.loading && !vm.busy) {
        <p class="catalog__status" role="status" aria-live="polite">
          Remote catalog is unavailable. Use Retry to load it.
        </p>
      }
      <main
        class="catalog__layout"
        [class.catalog__layout--creation]="model.creating"
        [attr.aria-busy]="vm.busy"
      >
        @if (!model.creating && vm.loaded) {
          <ngx-mfe-remote-rail
            [remotes]="vm.filtered"
            [selectedRemoteId]="
              model.creating ? null : (vm.selected?._id ?? null)
            "
            [searchTerm]="vm.searchTerm"
            [activeCount]="vm.activeCount"
            [archivedCount]="vm.archivedCount"
            [devModeCount]="vm.devModeCount"
            (remoteSelected)="selectRemote($event)"
            (searchChanged)="model.searchFor($event)"
          ></ngx-mfe-remote-rail>
        }

        @if (model.creating) {
          <ngx-create-mfe-page />
        } @else if (vm.loaded) {
          <ngx-mfe-remote-detail
            [remote]="vm.selected"
            [searchActive]="!!vm.searchTerm.trim()"
            [missingRemote]="vm.missingRemote"
            (clearSearch)="model.searchFor('')"
            (createRemote)="createRemote()"
            (update)="model.store.update($event)"
            (archive)="model.store.archive($event)"
            (delete)="model.store.delete($event)"
          ></ngx-mfe-remote-detail>
        }
      </main>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        min-height: max(
          0px,
          calc(100dvh - var(--catalog-top-offset, 0px))
        );
        background:
          radial-gradient(
            circle at 85% 15%,
            color-mix(
              in srgb,
              var(--ngx-color-primary) 8%,
              transparent
            ),
            transparent 28rem
          ),
          var(--ngx-color-canvas);
        color: var(--ngx-color-text);
      }

      :host.list-mfe-remotes--creation {
        display: flex;
        flex-direction: column;
      }

      :host.list-mfe-remotes--creation
        > ngx-mfe-remote-catalog-actions {
        flex-shrink: 0;
      }

      .catalog__layout {
        display: grid;
        grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
        gap: var(--ngx-space-4);
        width: calc(100% - 2rem);
        margin: 0 auto;
        padding: 1rem 0;
        align-items: start;
      }

      .catalog__layout--creation {
        flex: 1 0 auto;
        box-sizing: border-box;
        grid-template-columns: minmax(0, 1fr);
      }

      .catalog__progress {
        flex-shrink: 0;
      }

      .catalog__error,
      .catalog__status {
        margin: 1rem auto;
        width: calc(100% - 2rem);
      }
      .catalog__error {
        color: var(--ngx-color-error);
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ngx-space-4);
      }

      @media (max-width: 900px) {
        .catalog__layout {
          grid-template-columns: minmax(0, 1fr);
          width: calc(100% - 2rem);
        }
      }

      @media (max-width: 700px) {
        .catalog__layout {
          gap: 1rem;
        }
      }
    `,
  ],
})
export class ListMfeRemotes {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly model = inject(CatalogViewModel);

  constructor() {
    const host =
      inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const viewport = host.ownerDocument.defaultView!;
      let frame = 0;
      const measure = () => {
        // Use document position so scrolling does not change the available height.
        const top = Math.max(
          0,
          host.getBoundingClientRect().top + viewport.scrollY
        );
        host.style.setProperty('--catalog-top-offset', `${top}px`);
      };
      const schedule = () => {
        viewport.cancelAnimationFrame(frame);
        frame = viewport.requestAnimationFrame(measure);
      };
      const observer = new ResizeObserver(schedule);
      observer.observe(host.parentElement ?? host);
      viewport.addEventListener('resize', schedule);
      measure();
      destroyRef.onDestroy(() => {
        observer.disconnect();
        viewport.cancelAnimationFrame(frame);
        viewport.removeEventListener('resize', schedule);
      });
    });
  }

  selectRemote(id: string): void {
    void this.router.navigate(['list-mfe-remotes', id], {
      relativeTo: this.route.parent,
    });
  }

  backToList(): void {
    void this.router.navigate(['list-mfe-remotes'], {
      relativeTo: this.route.parent,
    });
  }

  createRemote(): void {
    if (!this.model.creating) {
      void this.router.navigate(['new-mfe-remote'], {
        relativeTo: this.route.parent,
      });
    }
  }
}
