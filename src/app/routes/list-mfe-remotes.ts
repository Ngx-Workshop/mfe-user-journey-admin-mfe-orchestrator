import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';
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
import { MfeRemoteCard } from '../components/mfe-remote-card';
import { ApiMfeRemotes } from '../services/api-mfe-remotes';

@Component({
  selector: 'ngx-mfe-remotes',
  imports: [
    MfeRemoteCard,
    AsyncPipe,
    MatCard,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    FormsModule,
    NgxParticleHeader,
    MatButton,
    MatProgressSpinnerModule,
  ],
  template: `
    <ngx-particle-header>
      <h1>MFE Orchestrator</h1>
    </ngx-particle-header>
    <div class="action-bar">
      <div class="flex-spacer"></div>
      <button matButton="filled" (click)="openDialog()">
        <mat-icon>note_add</mat-icon>
        Create a New MFE Remote
      </button>
    </div>
    <mat-card class="remote-list" appearance="outlined">
      <!-- Search Bar -->
      <mat-form-field appearance="outline" class="search-field">
        <mat-label>Search MFE Remotes</mat-label>
        <input
          matInput
          type="text"
          placeholder="Search by ID, name, URL, type, or status..."
          [(ngModel)]="searchTerm"
          (input)="onSearchChange($event)"
        />
        <mat-icon matPrefix>search</mat-icon>
      </mat-form-field>

      @for (mfeRemote of filteredMfeRemotes | async; track $index) {
      <ngx-mfe-remote
        [initialValue]="mfeRemote"
        (update)="updateMfeRemote($event)"
        (archive)="archiveMfeRemote($event)"
        (delete)="deleteMfeRemote($event)"
      ></ngx-mfe-remote>
      } @empty {
      <div class="loading-state">
        <mat-progress-spinner
          mode="indeterminate"
          diameter="48"
        ></mat-progress-spinner>
        <p>Loading MFE Remotes</p>
      </div>
      }
    </mat-card>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;

        ngx-particle-header h1 {
          font-size: 1.85rem;
          font-weight: 100;
          margin: 1.7rem 1rem;
        }

        mat-card {
          width: 100%;
          max-width: 800px;
          margin: 2em 0;
          padding: 1.7em;
          display: flex;
          flex-direction: column;
          gap: 1.7em;
        }

        .search-field {
          width: 100%;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem 1rem;
          color: rgba(0, 0, 0, 0.6);
        }

        .action-bar {
          position: sticky;
          top: 56px;
          height: 56px;
          z-index: 5;
          display: flex;
          flex-direction: row;
          width: 100%;
          background: var(--mat-sys-primary);
          align-items: center;
          a,
          button {
            color: var(--mat-sys-on-primary);
            background: var(--mat-sys-primary);
            margin: 0 12px;
          }
        }
      }
    `,
  ],
})
export class ListMfeRemotes {
  dialog = inject(MatDialog);
  apiMfeRemotes = inject(ApiMfeRemotes);
  mfeRemotes = this.apiMfeRemotes.mfeRemotes$;

  openDialog(): void {
    lastValueFrom(
      this.dialog
        .open(CreateMFEDialog, {
          panelClass: 'full-width-dialog',
        })
        .afterClosed()
        .pipe(
          switchMap((mfeRemote) =>
            iif(
              () => !!mfeRemote,
              this.apiMfeRemotes.createMfeRemote(mfeRemote),
              of(void 0)
            )
          )
        )
    );
  }

  // Search functionality
  searchTerm = '';
  private searchSubject = new BehaviorSubject<string>('');

  // Filtered MFE remotes based on search term
  filteredMfeRemotes = combineLatest([
    this.mfeRemotes,
    this.searchSubject.asObservable(),
  ]).pipe(
    map(([mfeRemotes, searchTerm]) => {
      if (!searchTerm || searchTerm.trim() === '') {
        return mfeRemotes;
      }

      const lowerSearchTerm = searchTerm.toLowerCase().trim();
      return mfeRemotes.filter(
        (mfeRemote) =>
          // Search in _id, name, remoteEntryUrl, type, and status
          mfeRemote._id.toLowerCase().includes(lowerSearchTerm) ||
          mfeRemote.name.toLowerCase().includes(lowerSearchTerm) ||
          mfeRemote.remoteEntryUrl
            .toLowerCase()
            .includes(lowerSearchTerm) ||
          mfeRemote.type.toLowerCase().includes(lowerSearchTerm) ||
          (mfeRemote.status &&
            mfeRemote.status.toLowerCase().includes(lowerSearchTerm))
      );
    })
  );

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.searchSubject.next(this.searchTerm);
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
