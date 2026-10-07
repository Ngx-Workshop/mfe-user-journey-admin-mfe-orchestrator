import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'app' },
  selector: 'ngx-admin-mfe-orchestrator-root',
  imports: [RouterOutlet],
  template: ` <router-outlet></router-outlet> `,
  styles: [``],
})
export class App {}

// 👇 **IMPORTANT FOR DYMANIC LOADING**
export default App;
