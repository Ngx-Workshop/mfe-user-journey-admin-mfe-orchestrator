import { AsyncPipe } from '@angular/common';
import { Component, inject, Input, output } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormControlStatus,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
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
import { MfeBasicFields } from './form-mfe-basic-fields';

import { MatDivider } from '@angular/material/divider';
import type {
  MfeRemoteDto,
  StructuralNavOverrideMode,
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
    MatExpansionModule,
    MfeBasicFields,
    StructuralFields,
    MatDivider,
  ],
  template: `
    @if (viewModel$ | async; as vm) {
    <form [formGroup]="vm.mfeRemoteForm">
      <h3>Structural Configuration</h3>
      <mat-divider></mat-divider>
      <ngx-structural-fields
        [mfeRemoteForm]="vm.mfeRemoteForm"
      ></ngx-structural-fields>

      <h3>Details</h3>
      <mat-divider></mat-divider>
      <ngx-mfe-basic-fields
        [mfeRemoteForm]="vm.mfeRemoteForm"
        [errorMessages]="vm.formErrorMessages"
        (verifyUrlClick)="verifyMfeUrl($event)"
      ></ngx-mfe-basic-fields>
      <mat-divider></mat-divider>
    </form>
    }
  `,
  styles: [
    `
      :host {
        form {
          display: flex;
          flex-direction: column;
          gap: 0.5em;
          mat-divider {
            margin-bottom: 1em;
          }
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
      nav: StructuralNavOverrideMode;
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

  verifyMfeUrl(url: string) {
    lastValueFrom(this.apiMfeRemotes.verifyMfeUrl(url));
  }
}
