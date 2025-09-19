import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'ngx-mfe-basic-fields',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    @if (formGroup(); as mfeRemoteForm) {
    <div [formGroup]="mfeRemoteForm">
      <mat-form-field>
        <mat-label>Name</mat-label>
        <input formControlName="name" matInput />
        @if (mfeRemoteForm.get('name')?.errors) {
        <mat-error>{{ errorMessages()['name'] }}</mat-error>
        }
      </mat-form-field>
      <mat-form-field>
        <mat-label>Description</mat-label>
        <textarea formControlName="description" matInput></textarea>
      </mat-form-field>
      <div class="remote-entry-url-group">
        <mat-form-field>
          <mat-label>Remote Entry URL</mat-label>
          <input formControlName="remoteEntryUrl" matInput />
          @if (mfeRemoteForm.get('remoteEntryUrl')?.errors) {
          <mat-error>{{ errorMessages()['remoteEntryUrl'] }}</mat-error>
          }
        </mat-form-field>
        <button mat-button (click)="verifyUrl()">Verify</button>
      </div>
    </div>
    }
  `,
  styles: [
    `
      :host {
        display: contents;
        > div {
          display: contents;
          .remote-entry-url-group {
            display: flex;
            flex-direction: row;
            gap: 0.5em;
            align-items: baseline;
            mat-form-field {
              flex: 1;
            }
          }
        }
      }
    `,
  ],
})
export class MfeBasicFields {
  formGroup = input.required<FormGroup>({ alias: 'mfeRemoteForm' });
  errorMessages = input.required<{ [key: string]: string }>();
  verifyUrlClick = output<string>();

  verifyUrl() {
    const url = this.formGroup().get('remoteEntryUrl')?.value;
    if (url) {
      this.verifyUrlClick.emit(url);
    }
  }
}
