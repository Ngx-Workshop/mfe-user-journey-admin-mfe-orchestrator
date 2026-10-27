import {
  createRemoteForm,
  remoteFormValue,
} from '../../../forms/mfe-remote-form';
import { inject, Injectable } from '@angular/core';
import type { MfeRemoteDto } from '@tmdjr/ngx-mfe-orchestrator-contracts';
import {
  BehaviorSubject,
  debounceTime,
  filter,
  tap,
  map,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  of,
} from 'rxjs';
import type { UrlVerificationState } from '../../../models/app.types';
import { MfeRemotesStore } from '../../../state/mfe-remotes-store';

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
            map(
              (ok): UrlVerificationState => (ok ? 'success' : 'error')
            ),
            startWith<UrlVerificationState>('verifying')
          )
        : of<UrlVerificationState>('idle')
    ),
    startWith<UrlVerificationState>('idle'),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private remoteId: string | undefined;
  private hasLocalEdits = false;

  private readonly form$ = this.initialValue.pipe(
    map(createRemoteForm),
    tap(() => {
      this.hasLocalEdits = false;
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly autosave$ = this.form$.pipe(
    switchMap((form) => {
      let previous = JSON.stringify(remoteFormValue(form));
      return form.valueChanges.pipe(
        tap(() => {
          this.hasLocalEdits = true;
        }),
        debounceTime(500),
        filter(() => !!this.remoteId && form.valid),
        map(() => remoteFormValue(form)),
        filter((value) => JSON.stringify(value) !== previous),
        tap((value) => {
          previous = JSON.stringify(value);
        })
      );
    })
  );

  readonly viewModel$ = this.form$.pipe(
    // Replacing an input detaches the old form's subscriptions immediately.
    switchMap((form) =>
      form.valueChanges.pipe(
        tap(() => {
          this.hasLocalEdits = true;
        }),
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
    // A refresh after an older save must not overwrite newer local edits.
    if (
      value._id &&
      value._id === this.remoteId &&
      this.hasLocalEdits
    )
      return;
    this.remoteId = value._id;
    this.verify(null);
    this.initialValue.next(value);
  }
  verify(url: string | null) {
    this.verification.next(url);
  }
}
