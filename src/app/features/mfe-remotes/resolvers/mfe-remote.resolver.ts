import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { MfeRemoteDtoExtraProps } from '../models/app.types';
import { MfeRemotesStore } from '../state/mfe-remotes-store';

export const mfeRemoteResolver: ResolveFn<
  MfeRemoteDtoExtraProps[]
> = () => inject(MfeRemotesStore).load();
