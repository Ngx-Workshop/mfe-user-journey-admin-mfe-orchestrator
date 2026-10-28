import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { MfeRemotesStore } from '../../../../../../../src/app/features/mfe-remotes/state/mfe-remotes-store';
import { MfeFormViewModel } from '../../../../../../../src/app/features/mfe-remotes/components/remote-configuration/form-mfe/mfe-form-view-model';

describe('MfeFormViewModel', () => {
  let model: MfeFormViewModel;
  let store: jasmine.SpyObj<MfeRemotesStore>;

  beforeEach(() => {
    store = jasmine.createSpyObj('MfeRemotesStore', ['verifyUrl']);
    TestBed.configureTestingModule({
      providers: [
        MfeFormViewModel,
        { provide: MfeRemotesStore, useValue: store },
      ],
    });
    model = TestBed.inject(MfeFormViewModel);
  });

  it('emits initial validity and values, then clears validation errors as fields are fixed', () => {
    let latest!: Parameters<typeof capture>[0];
    function capture(vm: {
      form: import('../../../../../../../src/app/features/mfe-remotes/forms/mfe-remote-form').RemoteForm;
      errors: { name: string; remoteEntryUrl: string };
    }) {
      latest = vm;
    }
    const sub = model.viewModel$.subscribe(capture);
    expect(latest.form.invalid).toBeTrue();
    latest.form.controls.name.setValue('Dashboard');
    latest.form.controls.remoteEntryUrl.setValue('not a URL');
    expect(latest.errors.remoteEntryUrl).toContain('valid');
    latest.form.controls.remoteEntryUrl.setValue(
      'https://example.com/remoteEntry.js'
    );
    expect(latest.form.valid).toBeTrue();
    expect(latest.errors.remoteEntryUrl).toBe('');
    sub.unsubscribe();
  });

  it('supports both type transitions and omits hidden configuration from emitted values', () => {
    let latest!: import('@tmdjr/ngx-mfe-orchestrator-contracts').CreateMfeRemoteDto;
    const sub = model.viewModel$.subscribe(
      (vm) => (latest = vm.value)
    );
    let form!: import('../../../../../../../src/app/features/mfe-remotes/forms/mfe-remote-form').RemoteForm;
    const formSub = model.viewModel$.subscribe(
      (vm) => (form = vm.form)
    );
    form.controls.type.setValue('structural');
    expect(latest.structuralSubType).toBe('header');
    expect(latest.structuralOverrides).toBeUndefined();
    expect(latest.requiresAuth).toBeFalse();
    form.controls.type.setValue('user-journey');
    form.controls.requiresAuth.setValue(true);
    expect(latest.requiresAuth).toBeTrue();
    expect(latest.structuralSubType).toBeUndefined();
    expect(latest.structuralOverrides?.header).toBe('disabled');
    sub.unsubscribe();
    formSub.unsubscribe();
  });

  it('detaches previous form streams when a different remote is selected', () => {
    let latest!: import('../../../../../../../src/app/features/mfe-remotes/forms/mfe-remote-form').RemoteForm;
    const sub = model.viewModel$.subscribe(
      (vm) => (latest = vm.form)
    );
    const oldForm = latest;
    model.initialize({ name: 'New remote', type: 'structural' });
    oldForm.controls.name.setValue('Stale edit');
    expect(latest.controls.name.value).toBe('New remote');
    sub.unsubscribe();
  });

  it('cancels stale URL verification results on edits and reinitialization', () => {
    const response = new Subject<boolean>();
    store.verifyUrl.and.returnValue(response);
    let state = '';
    const sub = model.verification$.subscribe(
      (value) => (state = value)
    );
    model.verify('https://example.com/remoteEntry.js');
    expect(state).toBe('verifying');
    model.verify(null);
    response.next(true);
    expect(state).toBe('idle');
    model.verify('https://example.com/remoteEntry.js');
    model.initialize({ name: 'Other' });
    response.next(false);
    expect(state).toBe('idle');
    sub.unsubscribe();
  });
  it('debounces valid changes by 500ms, skips initial/unchanged values and cancels stale forms', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate();
    const saves: import('@tmdjr/ngx-mfe-orchestrator-contracts').CreateMfeRemoteDto[] =
      [];
    model.initialize({
      _id: 'one',
      name: 'First',
      remoteEntryUrl: 'https://example.com/remoteEntry.js',
    });
    const sub = model.autosave$.subscribe((value) =>
      saves.push(value)
    );
    let form!: import('../../../../../../../src/app/features/mfe-remotes/forms/mfe-remote-form').RemoteForm;
    const values = model.viewModel$.subscribe((vm) => {
      form = vm.form;
    });
    try {
      jasmine.clock().tick(1000);
      expect(saves.length).toBe(0);
      form.controls.name.setValue('A');
      jasmine.clock().tick(400);
      form.controls.name.setValue('AB');
      jasmine.clock().tick(499);
      expect(saves.length).toBe(0);
      jasmine.clock().tick(1);
      expect(saves.map((value) => value.name)).toEqual(['AB']);
      form.controls.name.setValue('AB');
      jasmine.clock().tick(500);
      expect(saves.length).toBe(1);
      form.controls.description.setValue('Pending');
      jasmine.clock().tick(300);
      form.controls.name.setValue('');
      jasmine.clock().tick(500);
      expect(saves.length).toBe(1);
      form.controls.name.setValue('Valid');
      model.initialize({
        _id: 'two',
        name: 'Second',
        remoteEntryUrl: 'https://example.com/other.js',
      });
      jasmine.clock().tick(500);
      expect(saves.length).toBe(1);
      form.controls.name.setValue('Second edit');
      jasmine.clock().tick(500);
      expect(saves.at(-1)?.name).toBe('Second edit');
    } finally {
      sub.unsubscribe();
      values.unsubscribe();
      jasmine.clock().uninstall();
    }
  });

  it('preserves newer local edits when the catalog refreshes the selected remote', () => {
    model.initialize({ _id: 'one', name: 'First' });
    let form!: import('../../../../../../../src/app/features/mfe-remotes/forms/mfe-remote-form').RemoteForm;
    const sub = model.viewModel$.subscribe((vm) => {
      form = vm.form;
    });
    form.controls.name.setValue('Newer typing');
    const draft = form;
    model.initialize({
      _id: 'one',
      name: 'Older response',
      isAdmin: true,
    });
    expect(form).toBe(draft);
    expect(form.controls.name.value).toBe('Newer typing');
    form.controls.name.setValue('First');
    model.initialize({ _id: 'one', name: 'Older response' });
    expect(form.controls.name.value).toBe('First');
    model.initialize({ _id: 'two', name: 'Other' });
    expect(form.controls.name.value).toBe('Other');
    sub.unsubscribe();
  });
});
