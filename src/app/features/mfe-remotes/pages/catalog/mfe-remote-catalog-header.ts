import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mfe-remote-catalog-header' },
  selector: 'ngx-mfe-remote-catalog-header',
  imports: [NgxPanel],
  template: `
    <ngx-panel
      heading="Remote operations"
      eyebrow="ADMIN / CONTROL PLANE"
      shape="banner"
      background="grid"
    >
      <h1 class="mfe-remote-catalog-header__title">
        MFE Orchestrator
      </h1>
      <p class="mfe-remote-catalog-header__description">
        Discover, configure and preview your micro-frontends from one
        workspace.
      </p>
    </ngx-panel>
  `,
  styles: [
    `
      :host {
        display: block;
        width: min(100% - 3rem, 1440px);
        margin: 0 auto;
        padding: var(--ngx-space-6) 0;
      }
      .mfe-remote-catalog-header__description {
        margin: var(--ngx-space-2) 0 0;
        max-width: 65ch;
        color: var(--ngx-color-muted);
        line-height: 1.6;
      }
      .mfe-remote-catalog-header__title {
        margin: var(--ngx-space-2) 0;
        font-family: var(--ngx-font-mono);
        font-size: clamp(1.6rem, 4vw, 2.6rem);
        line-height: 1.2;
        letter-spacing: -0.04em;
      }
      @media (max-width: 900px) {
        :host {
          width: calc(100% - 2rem);
        }
      }
    `,
  ],
})
export class MfeRemoteCatalogHeader {}
