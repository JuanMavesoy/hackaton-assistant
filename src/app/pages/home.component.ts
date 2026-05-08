import { Component } from '@angular/core';
import { AssistantWidgetComponent } from '../ui/assistant-widget/assistant-widget.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [AssistantWidgetComponent],
  template: `
    <main class="landing">
      <app-assistant-widget />
    </main>
  `,
  styles: [
    `
      .landing {
        min-height: 100vh;

        background-image: url('/skandia-bg.png');
        background-size: cover;
        background-position: top center;
        background-repeat: no-repeat;

        position: relative;
      }

      app-assistant-widget {
        position: relative;
        z-index: 2;
      }
    `,
  ],
})
export class HomeComponent {}