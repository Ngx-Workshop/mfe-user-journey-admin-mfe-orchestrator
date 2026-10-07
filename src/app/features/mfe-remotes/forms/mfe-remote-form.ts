import { FormControl, FormGroup, Validators } from '@angular/forms';
import type {
  CreateMfeRemoteDto,
  MfeRemoteDto,
  MfeRemoteType,
  StructuralOverrideMode,
  StructuralSubType,
} from '@tmdjr/ngx-mfe-orchestrator-contracts';

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
