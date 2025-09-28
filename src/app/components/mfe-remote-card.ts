import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CdkAccordionModule } from '@angular/cdk/accordion';
import { NgClass } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { lastValueFrom, tap } from 'rxjs';
import { MfeRemoteDtoExtraProps } from '../app.types';
import { ConfirmDeleteDialog } from './dialog/dialog-confirm-delete';
import { DevModeOptions } from './dialog/dialog-dev-mode-options';
import { MfePreview } from './dialog/dialog-mfe-preview';
import { MfeForm } from './form-mfe/form-mfe';
import { MfeRemoteCardHeader } from './mfe-remote-card-header';

@Component({
  selector: 'ngx-mfe-remote',
  imports: [
    CdkAccordionModule,
    MatCardModule,
    MatButton,
    MatIconButton,
    MatIcon,
    MfeForm,
    MfeRemoteCardHeader,
    NgClass,
  ],
  animations: [
    trigger('expandCollapse', [
      state(
        'collapsed',
        style({
          height: '0px',
          opacity: 0,
        })
      ),
      state(
        'expanded',
        style({
          height: '*',
          opacity: 1,
        })
      ),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ]),
    ]),
    trigger('iconRotate', [
      state(
        'collapsed',
        style({
          transform: 'rotate(0deg)',
        })
      ),
      state(
        'expanded',
        style({
          transform: 'rotate(180deg)',
        })
      ),
      transition('collapsed <=> expanded', [
        animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)'),
      ]),
    ]),
  ],
  template: `
    @if (initialValue(); as mfe) {
    <mat-card
      appearance="filled"
      [ngClass]="{ 'dev-mode': mfe.isDevMode }"
    >
      <div class="accordion-toggle" (click)="accordionItem.toggle()">
        <p>{{ mfe.name }}</p>
        <mat-icon
          [@iconRotate]="
            accordionItem.expanded ? 'expanded' : 'collapsed'
          "
        >
          expand_more
        </mat-icon>
      </div>
      <cdk-accordion>
        <cdk-accordion-item #accordionItem="cdkAccordionItem">
          <div
            class="accordion-content"
            [@expandCollapse]="
              accordionItem.expanded ? 'expanded' : 'collapsed'
            "
          >
            <mat-card-header>
              <ngx-mfe-remote-card-header
                [initialValue]="initialValue()"
                (openDevModeOptions)="openDevModeOptions(mfe)"
                (previewMfeRemote)="previewMfeRemote(mfe)"
              ></ngx-mfe-remote-card-header>
            </mat-card-header>
            <mat-card-content>
              <ngx-mfe-form
                [initialValue]="initialValue()"
                (formStatus)="
                  disableUpdateButton = $event !== 'VALID'
                "
                (valueChange)="mfeRemote = $event"
              ></ngx-mfe-form>
            </mat-card-content>
            <mat-card-actions>
              <button matIconButton (click)="deleteRemote()">
                <mat-icon class="delete">delete</mat-icon>
              </button>
              <button matButton (click)="archive.emit(mfe)">
                {{ mfe.archived ? 'Archived' : 'Archive' }}
              </button>
              <div class="flex-spacer"></div>
              <button
                matButton
                (click)="updateRemote()"
                [disabled]="disableUpdateButton"
              >
                Update
              </button>
            </mat-card-actions>
          </div>
        </cdk-accordion-item>
      </cdk-accordion>
    </mat-card>
    }
  `,
  styles: [
    `
      :host {
        .accordion-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          cursor: pointer;
          mat-icon {
            font-size: 1.75rem;
            width: 1.75rem;
            height: 1.75rem;
            transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
          }
          p {
            font-size: 1.25rem;
            font-weight: 200;
          }
        }

        .accordion-content {
          display: block;
          overflow: hidden;
        }

        mat-card-content {
          display: flex;
          flex-direction: column;
        }

        mat-card-actions {
          display: flex;
          flex-direction: row;
          margin-bottom: 1em;
          .delete {
            color: var(--mat-sys-error);
          }
        }

        .flex-spacer {
          flex: 1;
        }

        .dev-mode {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 152, 0, 0.4);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(255, 152, 0, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 152, 0, 0);
          }
        }
      }
    `,
  ],
})
export class MfeRemoteCard {
  dialog = inject(MatDialog);
  formBuilder = inject(FormBuilder);
  initialValue = input.required<MfeRemoteDtoExtraProps>();

  mfeRemote: Partial<MfeRemoteDtoExtraProps> = {};

  update = output<MfeRemoteDtoExtraProps>();
  archive = output<MfeRemoteDtoExtraProps>();
  delete = output<MfeRemoteDtoExtraProps>();

  disableUpdateButton = false;

  updateRemote() {
    this.mfeRemote.name && this.initialValue() !== this.mfeRemote
      ? this.update.emit({
          ...this.initialValue(),
          ...this.mfeRemote,
        })
      : void 0;
  }

  deleteRemote() {
    lastValueFrom(
      this.dialog
        .open(ConfirmDeleteDialog, { data: this.initialValue() })
        .afterClosed()
        .pipe(
          tap((mfeRemote) => mfeRemote && this.delete.emit(mfeRemote))
        )
    );
  }

  previewMfeRemote(mfeRemote: MfeRemoteDtoExtraProps) {
    this.dialog.open(MfePreview, {
      data: mfeRemote,
      panelClass: ['mfe-preview', 'full-width-dialog'],
    });
  }

  openDevModeOptions(mfe: MfeRemoteDtoExtraProps) {
    this.dialog.open(DevModeOptions, {
      data: mfe,
      width: '600px',
    });
  }
}
