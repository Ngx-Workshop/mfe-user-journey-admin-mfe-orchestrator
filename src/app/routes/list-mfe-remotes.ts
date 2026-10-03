import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import {
  BehaviorSubject,
  combineLatest,
  iif,
  lastValueFrom,
  map,
  of,
  switchMap,
} from 'rxjs';
import { MfeRemoteDtoExtraProps } from '../app.types';
import { CreateMFEDialog } from '../components/dialog/dialog-create-mfe';
import { MfeRemoteCatalogActions } from '../components/mfe-remote-catalog-actions';
import { MfeRemoteCatalogHeader } from '../components/mfe-remote-catalog-header';
import { MfeRemoteDetail } from '../components/mfe-remote-detail';
import { MfeRemoteRail } from '../components/mfe-remote-rail';
import { ApiMfeRemotes } from '../services/api-mfe-remotes';

type CatalogViewModel = {
  filtered: MfeRemoteDtoExtraProps[];
  selected: MfeRemoteDtoExtraProps | null;
  activeCount: number;
  archivedCount: number;
  devModeCount: number;
};

@Component({
  selector: 'ngx-mfe-remotes',
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
      <main>
        <ngx-mfe-remote-rail
          [remotes]="vm.filtered"
          [selectedRemoteId]="vm.selected?._id ?? null"
          [searchTerm]="searchTerm"
          [activeCount]="vm.activeCount"
          [archivedCount]="vm.archivedCount"
          [devModeCount]="vm.devModeCount"
          (remoteSelected)="selectRemote($event)"
          (searchChanged)="setSearchTerm($event)"
        ></ngx-mfe-remote-rail>

        <ngx-mfe-remote-detail
          [remote]="vm.selected"
          (createRemote)="openDialog()"
          (update)="updateMfeRemote($event)"
          (archive)="archiveMfeRemote($event)"
          (delete)="deleteMfeRemote($event)"
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

      main {
        display: grid;
        grid-template-columns: minmax(280px, 340px) minmax(0, 1fr);
        gap: 1.5rem;
        width: min(100% - 3rem, 1440px);
        margin: 0 auto;
        padding: 1.5rem 0 3rem;
        align-items: start;
      }

      @media (max-width: 900px) {
        main {
          grid-template-columns: 280px minmax(440px, 1fr);
          width: 100%;
          padding: 1rem;
          overflow-x: auto;
        }
      }

      @media (max-width: 700px) {
        main {
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
  private dialog = inject(MatDialog);
  private apiMfeRemotes = inject(ApiMfeRemotes);
  private searchSubject = new BehaviorSubject('');
  private selectedRemoteId = new BehaviorSubject<string | null>(null);

  searchTerm = '';

  viewModel$ = combineLatest([
    this.apiMfeRemotes.mfeRemotes$,
    this.searchSubject,
    this.selectedRemoteId,
  ]).pipe(
    map(
      ([remotes, searchTerm, selectedRemoteId]): CatalogViewModel => {
        const normalizedSearchTerm = searchTerm.toLowerCase().trim();
        const filtered = normalizedSearchTerm
          ? remotes.filter((remote) =>
              [
                remote._id,
                remote.name,
                remote.remoteEntryUrl,
                remote.type,
                remote.status,
              ].some((value) =>
                value
                  ?.toLowerCase()
                  .includes(normalizedSearchTerm)
              )
            )
          : remotes;
        const selected =
          filtered.find((remote) => remote._id === selectedRemoteId) ??
          filtered[0] ??
          null;

        return {
          filtered,
          selected,
          activeCount: remotes.filter((remote) => !remote.archived)
            .length,
          archivedCount: remotes.filter((remote) => remote.archived)
            .length,
          devModeCount: remotes.filter((remote) => remote.isDevMode)
            .length,
        };
      }
    )
  );

  openDialog(): void {
    lastValueFrom(
      this.dialog
        .open(CreateMFEDialog, {
          panelClass: 'full-width-dialog',
        })
        .afterClosed()
        .pipe(
          switchMap((remote) =>
            iif(
              () => !!remote,
              this.apiMfeRemotes.createMfeRemote(remote),
              of(void 0)
            )
          )
        )
    );
  }

  selectRemote(remoteId: string) {
    this.selectedRemoteId.next(remoteId);
  }

  setSearchTerm(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  updateMfeRemote(remote: MfeRemoteDtoExtraProps) {
    lastValueFrom(this.apiMfeRemotes.updateMfeRemote(remote));
  }

  archiveMfeRemote(remote: MfeRemoteDto) {
    lastValueFrom(this.apiMfeRemotes.archiveMfeRemote(remote));
  }

  deleteMfeRemote(remote: MfeRemoteDto) {
    lastValueFrom(this.apiMfeRemotes.deleteMfeRemote(remote));
  }
}
