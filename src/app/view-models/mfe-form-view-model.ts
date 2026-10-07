import { inject, Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import type {
  CreateMfeRemoteDto,
  MfeRemoteDto,
  MfeRemoteType,
  StructuralOverrideMode,
  StructuralSubType,
} from '@tmdjr/ngx-mfe-orchestrator-contracts';
import {
  BehaviorSubject,
  map,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  of,
} from 'rxjs';
import type { UrlVerificationState } from '../components/form-mfe/form-mfe-basic-fields';
import { MfeRemotesStore } from '../state/mfe-remotes-store';

export function createRemoteForm(value: Partial<MfeRemoteDto>) {
  return new FormGroup({
    name: new FormControl(value.name ?? '', {
      nonNullable: true,
      validators: Validators.required,
    }),
    description: new FormControl(value.description ?? '', {
      nonNullable: true,
    }),
    remoteEntryUrl: new FormControl(value.remoteEntryUrl ?? '', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/^https?:\/\/[^\s/]+(?:\/[^\s]*)?$/),
      ],
    }),
    type: new FormControl<MfeRemoteType>(
      value.type ?? 'user-journey',
      { nonNullable: true }
    ),
    useRoutes: new FormControl(value.useRoutes ?? false, {
      nonNullable: true,
    }),
    requiresAuth: new FormControl(value.requiresAuth ?? false, {
      nonNullable: true,
    }),
    isAdmin: new FormControl(value.isAdmin ?? false, {
      nonNullable: true,
    }),
    structuralSubType: new FormControl<StructuralSubType>(
      value.structuralSubType ?? 'header',
      { nonNullable: true }
    ),
    structuralOverrides: new FormGroup({
      header: new FormControl<StructuralOverrideMode>(
        value.structuralOverrides?.header ?? 'disabled',
        { nonNullable: true }
      ),
      nav: new FormControl<StructuralOverrideMode>(
        value.structuralOverrides?.nav ?? 'disabled',
        { nonNullable: true }
      ),
      footer: new FormControl<StructuralOverrideMode>(
        value.structuralOverrides?.footer ?? 'disabled',
        { nonNullable: true }
      ),
    }),
  });
}
export type RemoteForm = ReturnType<typeof createRemoteForm>;

export function remoteFormValue(
  form: RemoteForm
): CreateMfeRemoteDto {
  const {
    structuralSubType,
    structuralOverrides,
    useRoutes,
    requiresAuth,
    isAdmin,
    ...common
  } = form.getRawValue();
  return common.type === 'structural'
    ? {
        ...common,
        structuralSubType,
        useRoutes: false,
        requiresAuth: false,
        isAdmin: false,
      }
    : {
        ...common,
        structuralOverrides,
        useRoutes,
        requiresAuth,
        isAdmin,
      };
}

@Injectable()
export class MfeFormViewModel {
  private readonly store = inject(MfeRemotesStore);
  private readonly initialValue = new BehaviorSubject<
    Partial<MfeRemoteDto>
  >({});
  private readonly verification = new Subject<string | null>();

  readonly verification$ = this.verification.pipe(
    switchMap((url) =>
      url
        ? this.store.verifyUrl(url).pipe(
            map((ok): UrlVerificationState =>
              ok ? 'success' : 'error'
            ),
            startWith<UrlVerificationState>('verifying')
          )
        : of<UrlVerificationState>('idle')
    ),
    startWith<UrlVerificationState>('idle'),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly viewModel$ = this.initialValue.pipe(
    map(createRemoteForm),
    // Replacing an input detaches the old form's subscriptions immediately.
    switchMap((form) =>
      form.valueChanges.pipe(
        startWith(form.getRawValue()),
        map(() => ({
          form,
          value: remoteFormValue(form),
          errors: {
            name: form.controls.name.hasError('required')
              ? 'Required'
              : '',
            remoteEntryUrl: form.controls.remoteEntryUrl.hasError(
              'required'
            )
              ? 'Required'
              : form.controls.remoteEntryUrl.hasError('pattern')
                ? 'Must be a valid HTTP(S) URL'
                : '',
          },
        }))
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  initialize(value: Partial<MfeRemoteDto>) {
    this.verify(null);
    this.initialValue.next(value);
  }
  verify(url: string | null) {
    this.verification.next(url);
  }
}
