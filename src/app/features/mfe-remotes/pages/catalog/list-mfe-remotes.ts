import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import type { CreateMfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { filter } from 'rxjs';
import { CatalogViewModel } from './catalog-view-model';
import { CreateMFEDialog } from './dialog-create-mfe';
import { MfeRemoteCatalogActions } from './mfe-remote-catalog-actions';
import { MfeRemoteDetail } from './mfe-remote-detail';
import { MfeRemoteRail } from './mfe-remote-rail';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'list-mfe-remotes ngx-design-system' },
  selector: 'ngx-mfe-remotes',
  providers: [CatalogViewModel],
  imports: [
    AsyncPipe,
    MatButton,
    NgxButton,
    MfeRemoteCatalogActions,
    MfeRemoteDetail,
    MfeRemoteRail,
  ],
  template: `
    <ngx-mfe-remote-catalog-actions
      [devModeCount]="(viewModel$ | async)?.devModeCount ?? 0"
      [saveNotification]="model.store.saveNotification$ | async"
      (retrySave)="model.store.retryUpdate()"
      (createRemote)="openDialog()"
    ></ngx-mfe-remote-catalog-actions>

    @if (viewModel$ | async; as vm) { @if (vm.error) {
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

    <main class="catalog__layout" [attr.aria-busy]="vm.busy">
      <ngx-mfe-remote-rail
        [remotes]="vm.filtered"
        [selectedRemoteId]="vm.selected?._id ?? null"
        [searchTerm]="vm.searchTerm"
        [activeCount]="vm.activeCount"
        [archivedCount]="vm.archivedCount"
        [devModeCount]="vm.devModeCount"
        (remoteSelected)="model.select($event)"
        (searchChanged)="model.searchFor($event)"
      ></ngx-mfe-remote-rail>

      <ngx-mfe-remote-detail
        [remote]="vm.selected"
        [searchActive]="!!vm.searchTerm.trim()"
        (clearSearch)="model.searchFor('')"
        (createRemote)="openDialog()"
        (update)="model.store.update($event)"
        (archive)="model.store.archive($event)"
        (delete)="model.store.delete($event)"
      ></ngx-mfe-remote-detail>
    </main>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        background: radial-gradient(
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

      .catalog__layout {
        display: grid;
        grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
        gap: var(--ngx-space-4);
        width: calc(100% - 2rem);
        margin: 0 auto;
        padding: 1rem 0;
        align-items: start;
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
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);
  readonly model = inject(CatalogViewModel);
  readonly viewModel$ = this.model.viewModel$;

  openDialog(): void {
    this.dialog
      .open<CreateMFEDialog, void, CreateMfeRemoteDto>(
        CreateMFEDialog,
        {
          width: '860px',
          maxWidth: 'calc(100vw - 2rem)',
          panelClass: [
            'ngx-design-system-overlay',
            'orchestrator-dialog',
            'orchestrator-dialog--wide',
          ],
          backdropClass: 'ngx-design-system-backdrop',
        }
      )
      .afterClosed()
      .pipe(
        filter((remote): remote is CreateMfeRemoteDto => !!remote),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((remote) => this.model.store.create(remote));
  }
}
