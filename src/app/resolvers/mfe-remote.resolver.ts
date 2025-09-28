import { inject } from '@angular/core';
import { MfeRemoteResolver } from '../app.types';
import { ApiMfeRemotes } from '../services/api-mfe-remotes';

export const mfeRemoteResolver: MfeRemoteResolver = () => {
  return inject(ApiMfeRemotes).fetchMfeRemotes().pipe();
};
