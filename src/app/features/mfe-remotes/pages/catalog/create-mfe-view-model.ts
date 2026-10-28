import {
  DestroyRef,
  Injectable,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Subject,
  catchError,
  map,
  of,
  startWith,
  switchMap,
} from 'rxjs';
import {
  createRemoteForm,
  remoteFormValue,
} from '../../forms/mfe-remote-form';
import type { UrlVerificationState } from '../../models/app.types';
import { MfeRemotesStore } from '../../state/mfe-remotes-store';

@Injectable()
export class CreateMfeViewModel {
  readonly store = inject(MfeRemotesStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly verificationRequests = new Subject<
    string | null
  >();
  readonly form = createRemoteForm({});
  readonly verification = signal<UrlVerificationState>('idle');
  readonly submitting = signal(false);
  readonly step = signal(0);

  get errors() {
    return {
      name: this.form.controls.name.hasError('required')
        ? 'Required'
        : '',
      remoteEntryUrl: this.form.controls.remoteEntryUrl.hasError(
        'required'
      )
        ? 'Required'
        : 'Must be a valid HTTP(S) URL',
    };
  }

  constructor() {
    this.verificationRequests
      .pipe(
        switchMap((url) =>
          url
            ? this.store.verifyUrl(url).pipe(
                map((ok): UrlVerificationState =>
                  ok ? 'success' : 'error'
                ),
                catchError(() => of<UrlVerificationState>('error')),
                startWith<UrlVerificationState>('verifying')
              )
            : of<UrlVerificationState>('idle')
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((state) => this.verification.set(state));

    this.form.controls.remoteEntryUrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.verificationRequests.next(null));

    this.store.state$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        if (state.pending === 0) this.submitting.set(false);
      });
  }

  verify(): void {
    const url = this.form.controls.remoteEntryUrl;
    url.markAsTouched();
    if (url.valid && this.verification() !== 'verifying') {
      this.verificationRequests.next(url.value);
    }
  }

  create(): void {
    if (
      this.form.invalid ||
      this.verification() !== 'success' ||
      this.step() !== 2 ||
      this.submitting()
    )
      return;
    this.submitting.set(true);
    this.store.create(remoteFormValue(this.form), (remote) => {
      if (!this.destroyRef.destroyed) {
        void this.router.navigate(['list-mfe-remotes', remote._id], {
          relativeTo: this.route.parent,
        });
      }
    });
  }
}
