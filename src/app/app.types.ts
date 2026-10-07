import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';

export type MfeRemoteDtoExtraProps = MfeRemoteDto & {
  isDevMode?: boolean;
};
