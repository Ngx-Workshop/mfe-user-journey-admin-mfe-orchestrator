import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { MfeRemotesStore } from '../../../src/app/state/mfe-remotes-store';
import { MfeFormViewModel } from '../../../src/app/view-models/mfe-form-view-model';

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
      form: import('../../../src/app/view-models/mfe-form-view-model').RemoteForm;
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
    let form!: import('../../../src/app/view-models/mfe-form-view-model').RemoteForm;
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
    let latest!: import('../../../src/app/view-models/mfe-form-view-model').RemoteForm;
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
});
