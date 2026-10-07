import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type {
  CreateMfeRemoteDto,
  MfeRemoteDto,
  UpdateMfeRemoteDto,
} from '@tmdjr/ngx-mfe-orchestrator-contracts';

/** Stateless transport. Callers own orchestration and error handling. */
@Injectable({ providedIn: 'root' })
export class ApiMfeRemotes {
  private readonly http = inject(HttpClient);
  private readonly url = '/api/mfe-remotes';

  fetchMfeRemotes() {
    return this.http.get<MfeRemoteDto[]>(this.url);
  }

  createMfeRemote(remote: CreateMfeRemoteDto) {
    return this.http.post<MfeRemoteDto>(this.url, remote);
  }

  updateMfeRemote(id: string, changes: UpdateMfeRemoteDto) {
    return this.http.patch<MfeRemoteDto>(
      `${this.url}/${id}`,
      changes
    );
  }

  archiveMfeRemote(remote: MfeRemoteDto) {
    return this.http.patch<MfeRemoteDto>(
      `${this.url}/${remote._id}/${remote.archived ? 'unarchive' : 'archive'}`,
      null
    );
  }

  deleteMfeRemote(id: string) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  verifyMfeUrl(url: string) {
    // A federation entry is JavaScript, not a JSON { status } endpoint.
    return this.http.get(url, { responseType: 'text' });
  }
}
