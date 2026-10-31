import { TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MfeBasicFields } from '../../../../../../../src/app/features/mfe-remotes/components/remote-configuration/form-mfe/form-mfe-basic-fields';
import {
  createRemoteForm,
  remoteFormValue,
} from '../../../../../../../src/app/features/mfe-remotes/forms/mfe-remote-form';

describe('remote domain selection', () => {
  it('preserves legacy membership and honors explicit arrays', () => {
    expect(
      createRemoteForm({ isAdmin: true }).controls.domains.value
    ).toEqual(['admin']);
    expect(createRemoteForm({}).controls.domains.value).toEqual([
      'workshop',
    ]);
    expect(
      createRemoteForm({ type: 'structural' }).controls.domains.value
    ).toEqual(['admin', 'workshop']);
    expect(
      createRemoteForm({ type: 'structural', isAdmin: true }).controls
        .domains.value
    ).toEqual(['admin']);
    expect(
      createRemoteForm({ isAdmin: true, domains: [] }).controls
        .domains.value
    ).toEqual([]);
    expect(
      createRemoteForm({ isAdmin: true, domains: ['workshop'] })
        .controls.domains.value
    ).toEqual(['workshop']);
  });

  it('preserves selection through type transitions and omits the legacy flag from payloads', () => {
    const form = createRemoteForm({ domains: ['admin', 'workshop'] });
    for (const type of ['structural', 'user-journey'] as const) {
      form.controls.type.setValue(type);
      expect(remoteFormValue(form).domains).toEqual([
        'admin',
        'workshop',
      ]);
      expect(remoteFormValue(form).isAdmin).toBeUndefined();
    }
    form.controls.domains.setValue([]);
    expect(remoteFormValue(form).domains).toEqual([]);
  });

  it('offers a themed multi-select in the first creation step and writes both selections', async () => {
    const fixture = TestBed.createComponent(MfeBasicFields);
    const form = createRemoteForm({ domains: [] });
    fixture.componentRef.setInput('mfeRemoteForm', form);
    fixture.componentRef.setInput('errorMessages', {});
    fixture.componentRef.setInput('fields', 'url');
    fixture.detectChanges();
    const select =
      await TestbedHarnessEnvironment.loader(fixture).getHarness(
        MatSelectHarness
      );
    expect(await select.isMultiple()).toBeTrue();
    await select.open();
    await select.clickOptions({ text: 'Admin' });
    await select.clickOptions({ text: 'Workshop' });
    expect(form.controls.domains.value).toEqual([
      'admin',
      'workshop',
    ]);
    expect(
      document
        .querySelector('.mat-mdc-select-panel')
        ?.classList.contains('ngx-design-system-overlay')
    ).toBeTrue();
    await select.close();
  });
});
