import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  Input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControlStatus,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import type {
  CreateMfeRemoteDto,
  MfeRemoteDto,
} from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { tap } from 'rxjs';
import { MfeBasicFields } from './form-mfe-basic-fields';
import { StructuralFields } from './form-mfe-structural-fields';
import { FormSection } from './form-section';
import { MfeFormViewModel } from './mfe-form-view-model';

/** Form orchestration: draft state is scoped to this component instance. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'form-mfe' },
  selector: 'ngx-mfe-form',
  providers: [MfeFormViewModel],
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MfeBasicFields,
    StructuralFields,
    FormSection,
    MatExpansionModule,
  ],
  template: `
    @if (viewModel$ | async; as vm) {
    <form class="form-mfe__mfe-form" [formGroup]="vm.form" novalidate>
      <ngx-form-section
        heading="Remote details"
        icon="description"
        [requiredNote]="true"
        description="Identify the remote and connect it to its deployed entry point."
      >
        <ngx-mfe-basic-fields
          [mfeRemoteForm]="vm.form"
          [errorMessages]="vm.errors"
          [verificationState]="
            (model.verification$ | async) ?? 'idle'
          "
          (verifyUrlClick)="model.verify($event)"
          (urlChanged)="model.verify(null)"
        />
      </ngx-form-section>
      <ngx-form-section
        heading="Integration behavior"
        icon="tune"
        description="Define how this remote participates in the host application."
      >
        <ngx-structural-fields [mfeRemoteForm]="vm.form" />
        @if (showLifecycleActions()) {
        <mat-accordion class="form-mfe__lifecycle">
          <mat-expansion-panel class="form-mfe__lifecycle-panel">
            <mat-expansion-panel-header
              class="form-mfe__lifecycle-header"
            >
              <mat-panel-title>Danger zone</mat-panel-title>
            </mat-expansion-panel-header>
            <p class="form-mfe__lifecycle-description">
              Archive this remote or permanently delete it from the
              catalog.
            </p>
            <ng-content select="[ngxMfeLifecycleActions]" />
          </mat-expansion-panel>
        </mat-accordion>
        }
      </ngx-form-section>
    </form>
    }
  `,
  styles: [
    `
      @use '@angular/material' as mat;

      :host {
        @include mat.expansion-overrides(
          (
            container-background-color: var(--ngx-color-surface),
            container-text-color: var(--ngx-color-text),
            container-shape: var(--ngx-radius),
            container-elevation-shadow: none,
            header-text-color: var(--ngx-color-text),
            header-description-color: var(--ngx-color-muted),
            header-indicator-color: var(--ngx-color-primary),
            header-text-font: var(--ngx-font-mono),
            header-text-size: 0.85rem,
            header-hover-state-layer-color:
              color-mix(
                in srgb,
                var(--ngx-color-primary) 8%,
                transparent
              ),
            header-focus-state-layer-color:
              color-mix(
                in srgb,
                var(--ngx-color-primary) 14%,
                transparent
              ),
            header-collapsed-state-height: 56px,
            header-expanded-state-height: 56px,
          )
        );
        display: block;
        container-type: inline-size;
      }
      .form-mfe__mfe-form {
        display: grid;
        gap: 1rem;
      }
      .form-mfe__lifecycle {
        display: block;
        margin-top: 1.25rem;
      }
      .form-mfe__lifecycle-panel {
        border: 1px solid var(--ngx-color-border);
      }
      .form-mfe__lifecycle-header {
        height: auto;
        min-height: 56px;
      }
      .form-mfe__lifecycle-description {
        margin: 0 0 var(--ngx-space-4);
        color: var(--ngx-color-muted);
        font-size: 0.78rem;
      }
      @container (min-width: 960px) {
        .form-mfe__mfe-form {
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          align-items: start;
        }
      }
    `,
  ],
})
export class MfeForm {
  readonly showLifecycleActions = input(false);
  readonly model = inject(MfeFormViewModel);
  readonly autosave = output<CreateMfeRemoteDto>();

  constructor() {
    this.model.autosave$
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((value) => this.autosave.emit(value));
  }

  readonly valueChange = output<CreateMfeRemoteDto>();
  readonly formStatus = output<FormControlStatus>();
  @Input() set initialValue(value: Partial<MfeRemoteDto>) {
    this.model.initialize(value);
  }

  readonly viewModel$ = this.model.viewModel$.pipe(
    tap((vm) => {
      this.valueChange.emit(vm.value);
      this.formStatus.emit(vm.form.status);
    })
  );
}
