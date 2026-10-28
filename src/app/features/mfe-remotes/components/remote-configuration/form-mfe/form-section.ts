import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import {
  NgxEntrance,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'form-section' },
  selector: 'ngx-form-section',
  imports: [MatIcon, NgxPanel, NgxEntrance],
  template: `
    <ngx-panel
      [heading]="heading()"
      eyebrow="CONFIGURATION"
      shape="chamfered"
      background="solid"
    >
      <div
        class="form-section__content"
        ngxEntrance="fade"
        [entranceDelay]="contentDelay()"
        [entranceDuration]="220"
      >
        <div class="form-section__heading">
          <span class="form-section__icon"
            ><mat-icon>{{ icon() }}</mat-icon></span
          >
          <div>
            <p>{{ description() }}</p>
          </div>
          <!-- @if (requiredNote()) {
          <span class="form-section__required"
            >Required fields marked *</span
          >
        } -->
        </div>
        <ng-content />
      </div>
    </ngx-panel>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .form-section__heading {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: var(--ngx-space-2);
        margin-bottom: var(--ngx-space-6);
        padding-bottom: var(--ngx-space-4);
        border-bottom: 1px solid var(--ngx-color-border);
      }
      .form-section__icon {
        color: var(--ngx-color-primary);
      }
      .form-section__heading > div {
        flex: 1 1 180px;
      }
      p {
        margin: 0;
        color: var(--ngx-color-muted);
        font-size: 0.8rem;
        line-height: 1.5;
      }
      .form-section__required {
        color: var(--ngx-color-muted);
        font: var(--ngx-font-label);
      }
    `,
  ],
})
export class FormSection {
  contentDelay = input(820);

  heading = input.required<string>();
  description = input.required<string>();
  icon = input.required<string>();
  requiredNote = input(false);
}
