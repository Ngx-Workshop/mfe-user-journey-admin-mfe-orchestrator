import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import {
  BehaviorSubject,
  combineLatest,
  lastValueFrom,
  map,
} from 'rxjs';
import { Hero } from '../components/hero';
import { MfeRemoteCard } from '../components/mfe-remote-card';
import { ApiMfeRemotes } from '../services/api-mfe-remotes';

import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Component({
  selector: 'ngx-mfe-remotes',
  imports: [
    Hero,
    MfeRemoteCard,
    AsyncPipe,
    MatCard,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    FormsModule,
  ],
  template: `
    <ngx-hero></ngx-hero>
    <mat-card appearance="outlined">
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
      }
    </mat-card>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3em;

        mat-card {
          width: 100%;
          max-width: 800px;
          margin-bottom: 2em;
          padding: 1.7em;
          display: flex;
          flex-direction: column;
          gap: 1.7em;
        }

        .search-field {
          width: 100%;
        }
      }
    `,
  ],
})
export class ListMfeRemotes {
  dialog = inject(MatDialog);
  apiMfeRemotes = inject(ApiMfeRemotes);
  mfeRemotes = this.apiMfeRemotes.mfeRemotes$;

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

  updateMfeRemote(remote: MfeRemoteDto) {
    lastValueFrom(this.apiMfeRemotes.updateMfeRemote(remote));
  }

  archiveMfeRemote(remote: MfeRemoteDto) {
    lastValueFrom(this.apiMfeRemotes.archiveMfeRemote(remote));
  }

  deleteMfeRemote(remote: MfeRemoteDto) {
    lastValueFrom(this.apiMfeRemotes.deleteMfeRemote(remote));
  }
}
