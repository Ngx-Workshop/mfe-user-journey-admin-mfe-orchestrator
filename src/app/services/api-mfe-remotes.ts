import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, catchError, of, switchMap, tap } from 'rxjs';

import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

@Injectable({
  providedIn: 'root',
})
export class ApiMfeRemotes {
  httpClient = inject(HttpClient);

  mfeRemotes = new BehaviorSubject<MfeRemoteDto[]>([]);
  mfeRemotes$ = this.mfeRemotes.asObservable();

  testAuthEndpoint() {
    return this.httpClient
      .get<{ status: string }>('/api/mfe-remotes/auth-test')
      .pipe(
        tap((response) => {
          if (response.status !== 'ok') {
            throw new Error('Authentication test failed');
          }
        }),
        catchError((error) => {
          console.warn('Error testing authentication endpoint:', error);
          return of({ status: 'error' });
        })
      );
  }

  fetchMfeRemotes() {
    return this.httpClient.get<MfeRemoteDto[]>('/api/mfe-remotes').pipe(
      tap((remotes) => this.mfeRemotes.next(remotes)),
      catchError((error) => {
        console.warn('Error fetching MFE remotes:', error);
        return of([]);
      })
    );
  }

  createMfeRemote(mfeRemote: MfeRemoteDto) {
    return this.httpClient
      .post<MfeRemoteDto>('/api/mfe-remotes', mfeRemote)
      .pipe(
        switchMap(() => this.fetchMfeRemotes()),
        catchError((error) => {
          console.warn('Error creating MFE remote:', error);
          return of([]);
        })
      );
  }

  updateMfeRemote({
    _id,
    lastUpdated,
    version,
    __v,
    ...partialMfeRemote
  }: MfeRemoteDto) {
    return this.httpClient
      .patch<MfeRemoteDto>(`/api/mfe-remotes/${_id}`, partialMfeRemote)
      .pipe(
        switchMap(() => this.fetchMfeRemotes()),
        catchError((error) => {
          console.warn('Error updating MFE remote:', error);
          return of([]);
        })
      );
  }

  archiveMfeRemote(mfeRemote: MfeRemoteDto) {
    return this.httpClient
      .patch<MfeRemoteDto>(
        `/api/mfe-remotes/${mfeRemote._id}/${
          mfeRemote.archived ? 'unarchive' : 'archive'
        }`,
        void 0
      )
      .pipe(
        switchMap(() => this.fetchMfeRemotes()),
        catchError((error) => {
          console.warn('Error archiving MFE remote:', error);
          return of([]);
        })
      );
  }

  deleteMfeRemote(mfeRemote: MfeRemoteDto) {
    return this.httpClient
      .delete<MfeRemoteDto>(`/api/mfe-remotes/${mfeRemote._id}`)
      .pipe(
        switchMap(() => this.fetchMfeRemotes()),
        catchError((error) => {
          console.warn('Error deleting MFE remote:', error);
          return of([]);
        })
      );
  }

  verifyMfeUrl(remoteEntryUrl: string) {
    return this.httpClient.get<{ status: string }>(remoteEntryUrl).pipe(
      tap((response) => {
        if (response.status !== 'ok') {
          throw new Error('Remote entry URL is not valid');
        }
      }),
      catchError((error) => {
        console.warn('Error verifying MFE URL:', error);
        return of({ status: 'error' });
      })
    );
  }
}
