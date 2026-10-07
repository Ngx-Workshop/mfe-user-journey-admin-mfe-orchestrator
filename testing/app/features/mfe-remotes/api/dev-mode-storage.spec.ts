import { TestBed } from '@angular/core/testing';
import { LocalStorageBrokerService } from '@tmdjr/ngx-local-storage-client';
import { firstValueFrom } from 'rxjs';
import { DevModeStorage } from '../../../../../src/app/features/mfe-remotes/api/dev-mode-storage';

describe('DevModeStorage', () => {
  it('uses the bare remote ID for broker writes and the prefixed key for the shell mirror', async () => {
    const broker = jasmine.createSpyObj('broker', [
      'setItem',
      'removeItem',
    ]);
    broker.setItem.and.resolveTo(true);
    broker.removeItem.and.resolveTo(true);
    TestBed.configureTestingModule({
      providers: [
        { provide: LocalStorageBrokerService, useValue: broker },
      ],
    });
    const adapter = TestBed.inject(DevModeStorage);
    const set = spyOn(localStorage, 'setItem');
    const remove = spyOn(localStorage, 'removeItem');
    await firstValueFrom(
      adapter.set('remote-1', 'http://localhost:4201/remoteEntry.js')
    );
    expect(broker.setItem).toHaveBeenCalledWith(
      'remote-1',
      'http://localhost:4201/remoteEntry.js'
    );
    expect(set).toHaveBeenCalledWith(
      'mfe-remotes:remote-1',
      'http://localhost:4201/remoteEntry.js'
    );
    await firstValueFrom(adapter.set('remote-1', null));
    expect(broker.removeItem).toHaveBeenCalledWith('remote-1');
    expect(remove).toHaveBeenCalledWith('mfe-remotes:remote-1');
  });
});
