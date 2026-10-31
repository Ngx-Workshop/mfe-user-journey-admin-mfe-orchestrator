import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  NgxActionBar,
  NgxButton,
  NgxInlineStatus,
  NgxSaveFeedback,
} from '@tmdjr/ngx-workshop-design-system';
import { SaveNotification } from '../../models/save-notification';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-catalog-actions' },
  selector: 'ngx-mfe-remote-catalog-actions',
  imports: [
    NgxActionBar,
    NgxInlineStatus,
    NgxSaveFeedback,
    NgxButton,
    MatButton,
    MatIcon,
  ],
  template: `
    <ngx-action-bar
      heading="MFE Orchestrator"
      (heightChange)="heightChange.emit($event)"
    >
      <ngx-inline-status
        ngxActionBarIndicators
        [label]="devModeLabel()"
        [tone]="devModeCount() > 0 ? 'warning' : 'neutral'"
        [announce]="true"
      />
      <ngx-save-feedback
        ngxActionBarFeedback
        [state]="saveNotification()?.status ?? 'idle'"
        [name]="saveNotification()?.name ?? ''"
        [retryable]="true"
        (retry)="retrySave.emit()"
      />
      <button
        mat-flat-button
        ngxButton
        shape="chevron"
        surface="outline"
        type="button"
        (click)="creating() ? backToList.emit() : createRemote.emit()"
      >
        <mat-icon>{{
          creating() ? 'arrow_forward' : 'add'
        }}</mat-icon>
        {{ creating() ? 'MFE Remote List' : 'New remote' }}
      </button>
    </ngx-action-bar>
  `,
  styles: [
    `
      :host {
        display: contents;
        --ngx-action-bar-top: var(--catalog-toolbar-top, 96px);
      }
      @media (max-width: 720px) {
        :host {
          --ngx-action-bar-top: var(--catalog-toolbar-top, 76px);
        }
      }
    `,
  ],
})
export class MfeRemoteCatalogActions {
  readonly creating = input(false);
  readonly backToList = output<void>();
  readonly devModeCount = input(0);
  readonly saveNotification = input<SaveNotification>(null);
  readonly retrySave = output<void>();
  readonly heightChange = output<number>();
  readonly createRemote = output<void>();
  readonly devModeLabel = computed(
    () =>
      `${this.devModeCount()} ${this.devModeCount() === 1 ? 'MFE' : 'MFEs'} in dev mode`
  );
}
