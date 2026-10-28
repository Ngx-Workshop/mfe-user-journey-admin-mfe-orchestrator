import { Route } from '@angular/router';
import { userAuthenticatedGuard } from '@tmdjr/ngx-user-metadata';

export const Routes: Route[] = [
  {
    path: '',
    canActivate: [userAuthenticatedGuard],
    children: [
      { path: '', redirectTo: 'list-mfe-remotes', pathMatch: 'full' },
      ...[
        'new-mfe-remote',
        'list-mfe-remotes/:remoteId',
        'list-mfe-remotes',
      ].map((path): Route => ({
        path,
        data: { creating: path === 'new-mfe-remote' },
        loadComponent: () =>
          import('./features/mfe-remotes/pages/catalog/list-mfe-remotes').then(
            (m) => m.ListMfeRemotes
          ),
      })),
    ],
  },
];
