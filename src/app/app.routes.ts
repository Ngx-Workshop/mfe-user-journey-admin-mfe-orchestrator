import { Route } from '@angular/router';
import { userAuthenticatedGuard } from '@tmdjr/ngx-user-metadata';
import { mfeRemoteResolver } from './features/mfe-remotes/resolvers/mfe-remote.resolver';

export const Routes: Route[] = [
  {
    path: '',
    canActivate: [userAuthenticatedGuard],
    children: [
      { path: '', redirectTo: 'list-mfe-remotes', pathMatch: 'full' },
      {
        path: 'list-mfe-remotes',
        loadComponent: () =>
          import(
            './features/mfe-remotes/pages/catalog/list-mfe-remotes'
          ).then((m) => m.ListMfeRemotes),
        resolve: { mfeRemotes: mfeRemoteResolver },
      },
    ],
  },
];
