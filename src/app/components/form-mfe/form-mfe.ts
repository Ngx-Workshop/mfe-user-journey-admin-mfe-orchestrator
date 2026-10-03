import { AsyncPipe } from '@angular/common';
import {
  Component,
  inject,
  Input,
  output,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormControlStatus,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import {
  BehaviorSubject,
  forkJoin,
  lastValueFrom,
  map,
  mergeMap,
  startWith,
  tap,
} from 'rxjs';
import { ApiMfeRemotes } from '../../services/api-mfe-remotes';
import {
  MfeBasicFields,
  UrlVerificationState,
} from './form-mfe-basic-fields';
import type {
  MfeRemoteDto,
  StructuralOverrideMode,
} from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { StructuralFields } from './form-mfe-structural-fields';

type ViewModel = {
  mfeRemoteForm: FormGroup;
  formErrorMessages: { [key: string]: string };
  errorMessages: { [key: string]: string };
};

@Component({
  selector: 'ngx-mfe-form',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MfeBasicFields,
    StructuralFields,
    MatIcon,
  ],
  template: `
    @if (viewModel$ | async; as vm) {
      <form [formGroup]="vm.mfeRemoteForm" novalidate>
        <section class="form-section">
          <div class="section-heading">
            <span class="section-icon">
              <mat-icon>description</mat-icon>
            </span>
            <div>
              <h3>Remote details</h3>
              <p>
                Identify the remote and connect it to its deployed
                entry point.
              </p>
            </div>
            <span class="required-note">Required fields marked *</span>
          </div>
          <ngx-mfe-basic-fields
            [mfeRemoteForm]="vm.mfeRemoteForm"
            [errorMessages]="vm.formErrorMessages"
            [verificationState]="verificationState()"
            (verifyUrlClick)="verifyMfeUrl($event)"
            (urlChanged)="resetUrlVerification()"
          ></ngx-mfe-basic-fields>
        </section>

        <section class="form-section">
          <div class="section-heading">
            <span class="section-icon">
              <mat-icon>tune</mat-icon>
            </span>
            <div>
              <h3>Integration behavior</h3>
              <p>
                Define how this remote participates in the host
                application.
              </p>
            </div>
          </div>
          <ngx-structural-fields
            [mfeRemoteForm]="vm.mfeRemoteForm"
          ></ngx-structural-fields>
        </section>
      </form>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      form {
        display: grid;
        gap: 1rem;
      }

      .form-section {
        padding: 1.15rem;
        background: var(--mat-sys-surface-container-lowest);
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 16px;
      }

      .section-heading {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1.25rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--mat-sys-outline-variant);
      }

      .section-icon {
        display: grid;
        flex: 0 0 auto;
        place-items: center;
        width: 40px;
        height: 40px;
        color: var(--mat-sys-primary);
        background: var(--mat-sys-primary-container);
        border-radius: 12px;
      }

      .section-icon mat-icon {
        width: 1.25rem;
        height: 1.25rem;
        font-size: 1.25rem;
      }

      h3,
      p {
        margin: 0;
      }

      h3 {
        font-size: 1rem;
        font-weight: 600;
      }

      p {
        margin-top: 0.2rem;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.76rem;
        line-height: 1.4;
      }

      .required-note {
        margin-left: auto;
        color: var(--mat-sys-on-surface-variant);
        font-size: 0.65rem;
        white-space: nowrap;
      }

      @media (max-width: 620px) {
        .form-section {
          padding: 0.85rem;
        }

        .section-heading {
          align-items: flex-start;
        }

        .required-note {
          display: none;
        }
      }
    `,
  ],
})
export class MfeForm {
  formBuilder = inject(FormBuilder);
  apiMfeRemotes = inject(ApiMfeRemotes);

  valueChange = output<Partial<MfeRemoteDto>>();
  formStatus = output<FormControlStatus | null>();
  verificationState = signal<UrlVerificationState>('idle');
  private verificationRequestId = 0;

  @Input('initialValue')
  set initialValue(value: Partial<MfeRemoteDto>) {
    this.initialValue$.next(value);
  }
  initialValue$ = new BehaviorSubject<Partial<MfeRemoteDto>>({
    name: '',
    description: '',
    remoteEntryUrl: '',
    type: 'user-journey',
    structuralSubType: 'header',
    useRoutes: false,
    requiresAuth: false,
    isAdmin: false,
    structuralOverrides: {
      header: 'disabled',
      nav: 'disabled',
      footer: 'disabled',
    },
  });

  private createFormGroup(
    baseFormGroup: any,
    value: Partial<MfeRemoteDto>
  ): any {
    if (value.type === 'user-journey') {
      return {
        ...baseFormGroup,
        useRoutes: [value.useRoutes ?? false],
        requiresAuth: [value.requiresAuth ?? false],
        isAdmin: [value.isAdmin ?? false],
        structuralOverrides: this.createStructuralOverridesFormGroup(
          value.structuralOverrides
        ),
      };
    }

    // STRUCTURAL: ensure the structuralSubType control exists at creation time
    return {
      ...baseFormGroup,
      structuralSubType: new FormControl(
        value.structuralSubType ?? 'header',
        {
          nonNullable: true,
        }
      ),
    };
  }

  private createStructuralOverridesFormGroup(
    structuralOverrides?: Partial<{
      header: StructuralOverrideMode;
      nav: StructuralOverrideMode;
      footer: StructuralOverrideMode;
    }>
  ): FormGroup {
    return this.formBuilder.nonNullable.group({
      header: [
        structuralOverrides?.header || 'disabled',
        Validators.required,
      ],
      nav: [
        structuralOverrides?.nav || 'disabled',
        Validators.required,
      ],
      footer: [
        structuralOverrides?.footer || 'disabled',
        Validators.required,
      ],
    });
  }

  viewModel$ = this.initialValue$.pipe(
    map((value) => {
      const baseFormGroup = {
        name: [value.name, Validators.required],
        description: [value.description],
        remoteEntryUrl: [value.remoteEntryUrl, [Validators.required]],
        type: [value.type, [Validators.required]],
      };

      const formGroup = this.createFormGroup(baseFormGroup, value);

      return {
        mfeRemoteForm: this.formBuilder.nonNullable.group(formGroup),
        errorMessages: {
          required: 'Required',
          pattern: 'Must be a valid URL',
        },
        formErrorMessages: {
          name: '',
          remoteEntryUrl: '',
        },
      };
    }),
    mergeMap((viewModel: ViewModel) =>
      forkJoin([
        this.watchStatusChanges(viewModel),
        this.watchFormValueChanges(viewModel),
        this.watchTypeChanges(viewModel),
      ]).pipe(
        startWith(null),
        map(() => viewModel)
      )
    )
  );

  watchStatusChanges(viewModel: ViewModel) {
    return viewModel.mfeRemoteForm.statusChanges.pipe(
      tap((status) => this.formStatus.emit(status)),
      tap(() => this.setErrorsMessages(viewModel))
    );
  }

  watchFormValueChanges(viewModel: ViewModel) {
    return viewModel.mfeRemoteForm.valueChanges.pipe(
      tap((value) => {
        // If type is STRUCTURAL, remove structuralOverrides from the emitted value
        if (value.type === 'structural') {
          const { structuralOverrides, ...valueWithoutOverrides } =
            value;
          this.valueChange.emit(valueWithoutOverrides);
        } else {
          this.valueChange.emit(value);
        }
      })
    );
  }

  watchTypeChanges(viewModel: ViewModel) {
    return viewModel.mfeRemoteForm.get('type')!.valueChanges.pipe(
      tap((type) => {
        if (type === 'user-journey') {
          viewModel.mfeRemoteForm.removeControl('structuralSubType');
          viewModel.mfeRemoteForm.addControl(
            'structuralOverrides',
            this.createStructuralOverridesFormGroup()
          );
        } else if (type === 'structural') {
          viewModel.mfeRemoteForm.removeControl(
            'structuralOverrides'
          );
          viewModel.mfeRemoteForm.addControl(
            'structuralSubType',
            new FormControl('header', { nonNullable: true })
          );
        }
      })
    );
  }

  setErrorsMessages({
    mfeRemoteForm,
    formErrorMessages,
    errorMessages,
  }: ViewModel): void {
    Object.keys(mfeRemoteForm.controls).forEach((element) => {
      const errors = mfeRemoteForm.get(element)?.errors;
      if (errors) {
        const error = Object.keys(errors)[0];
        formErrorMessages[element] = errorMessages[error];
      }
    });
  }

  resetUrlVerification() {
    this.verificationRequestId++;
    this.verificationState.set('idle');
  }

  async verifyMfeUrl(url: string) {
    const requestId = ++this.verificationRequestId;
    this.verificationState.set('verifying');
    const result = await lastValueFrom(
      this.apiMfeRemotes.verifyMfeUrl(url)
    );

    if (requestId === this.verificationRequestId) {
      this.verificationState.set(
        result.status === 'ok' ? 'success' : 'error'
      );
    }
  }
}
