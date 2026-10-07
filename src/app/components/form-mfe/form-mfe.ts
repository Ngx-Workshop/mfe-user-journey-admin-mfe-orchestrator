import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Input,
  output,
} from '@angular/core';
import {
  FormControlStatus,
  ReactiveFormsModule,
} from '@angular/forms';
import type {
  CreateMfeRemoteDto,
  MfeRemoteDto,
} from '@tmdjr/ngx-mfe-orchestrator-contracts';
import { tap } from 'rxjs';
import { MfeFormViewModel } from '../../view-models/mfe-form-view-model';
import { MfeBasicFields } from './form-mfe-basic-fields';
import { StructuralFields } from './form-mfe-structural-fields';
import { FormSection } from './form-section';

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
  ],
  template: `
    @if (viewModel$ | async; as vm) {
      <form
        class="form-mfe__mfe-form"
        [formGroup]="vm.form"
        novalidate
      >
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
        </ngx-form-section>
      </form>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .form-mfe__mfe-form {
        display: grid;
        gap: 1rem;
      }
    `,
  ],
})
export class MfeForm {
  readonly model = inject(MfeFormViewModel);
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
