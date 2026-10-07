import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import type { CreateMfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { CreateMFEDialog } from '../components/dialog/dialog-create-mfe';
import { MfeRemoteCatalogActions } from '../components/mfe-remote-catalog-actions';
import { MfeRemoteCatalogHeader } from '../components/mfe-remote-catalog-header';
import { MfeRemoteDetail } from '../components/mfe-remote-detail';
import { MfeRemoteRail } from '../components/mfe-remote-rail';
import { CatalogViewModel } from '../view-models/catalog-view-model';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'list-mfe-remotes' },
  selector: 'ngx-mfe-remotes',
  providers: [CatalogViewModel],
  imports: [
    AsyncPipe,
    MfeRemoteCatalogActions,
    MfeRemoteCatalogHeader,
    MfeRemoteDetail,
    MfeRemoteRail,
  ],
  template: `
    <ngx-mfe-remote-catalog-header></ngx-mfe-remote-catalog-header>
    <ngx-mfe-remote-catalog-actions
      (createRemote)="openDialog()"
    ></ngx-mfe-remote-catalog-actions>

    @if (viewModel$ | async; as vm) {
      @if (vm.error) {
        <div class="catalog__error" role="alert">
          {{ vm.error }}
          <button
            type="button"
            (click)="model.store.refresh()"
            [disabled]="vm.busy"
          >
            Retry
          </button>
        </div>
      }
      @if (vm.busy) {
        <p class="catalog__status" role="status">Updating catalog…</p>
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
        min-height: 100vh;
        background:
          radial-gradient(
            circle at 85% 15%,
            color-mix(
              in srgb,
              var(--mat-sys-primary) 8%,
              transparent
            ),
            transparent 28rem
          ),
          var(--mat-sys-surface-container-lowest);
      }

      .catalog__layout {
        display: grid;
        grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
        gap: 1.5rem;
        width: min(100% - 3rem, 1440px);
        margin: 0 auto;
        padding: 1.5rem 0 3rem;
        align-items: start;
      }

      .catalog__error,
      .catalog__status {
        margin: 1rem auto;
        width: min(100% - 3rem, 1440px);
      }
      .catalog__error {
        color: var(--mat-sys-error);
      }

      @media (max-width: 900px) {
        .catalog__layout {
          grid-template-columns: 280px minmax(440px, 1fr);
          width: 100%;
          padding: 1rem;
          overflow-x: auto;
        }
      }

      @media (max-width: 700px) {
        .catalog__layout {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          padding: 1rem;
          overflow: visible;
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
          panelClass: [
            'orchestrator-dialog',
            'orchestrator-dialog--wide',
          ],
          backdropClass: 'blur-backdrop',
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
