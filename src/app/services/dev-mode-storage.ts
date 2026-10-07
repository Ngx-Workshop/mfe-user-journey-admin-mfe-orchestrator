import { inject, Injectable } from '@angular/core';
import { LocalStorageBrokerService } from '@tmdjr/ngx-local-storage-client';
import { defer } from 'rxjs';

/** Keeps the shell's local mirror and the cross-origin broker in sync. */
@Injectable({ providedIn: 'root' })
export class DevModeStorage {
  private readonly broker = inject(LocalStorageBrokerService);

  keys() {
    return defer(() => this.broker.keys());
  }

  get(id: string) {
    return defer(() => this.broker.getItem(id));
  }

  set(id: string, url: string | null) {
    return defer(async () => {
      if (url) {
        await this.broker.setItem(id, url);
        localStorage.setItem(`mfe-remotes:${id}`, url);
      } else {
        await this.broker.removeItem(id);
        localStorage.removeItem(`mfe-remotes:${id}`);
      }
    });
  }
}
