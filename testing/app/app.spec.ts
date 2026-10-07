import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from '../../src/app/app';

describe('App', () => {
  it('hosts the federated router outlet', async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('router-outlet')
    ).not.toBeNull();
  });
});
