import { ResolveFn } from '@angular/router';
import { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { Observable } from 'rxjs';

export type MfeRemoteDtoExtraProps = MfeRemoteDto & {
  isDevMode?: boolean;
};

export type MfeRemoteResolver = ResolveFn<
  Observable<MfeRemoteDtoExtraProps[]>
>;
