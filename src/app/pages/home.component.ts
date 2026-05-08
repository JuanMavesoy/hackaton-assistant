import { Component } from '@angular/core';
import { AssistantWidgetComponent } from '../ui/assistant-widget/assistant-widget.component';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [AssistantWidgetComponent],
  template: `
    <main class="page">
      <section class="hero">
        <h1>Demo Hackatón</h1>
        <p>
          Plantilla lista: widget flotante + chat (texto/voz) + avatar + CTA “Aportar ahora”.
        </p>
      </section>

      <app-assistant-widget />
    </main>
  `,
  styles: [
    `
      .page {
        min-height: 100%;
        padding: 48px 20px 80px;
      }
      .hero {
        max-width: 920px;
        margin: 0 auto;
        padding: 28px 24px;
        border-radius: var(--radius);
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.10), rgba(255, 255, 255, 0.04));
        box-shadow: var(--shadow);
        border: 1px solid rgba(255, 255, 255, 0.14);
      }
      h1 {
        margin: 0 0 8px;
        letter-spacing: -0.02em;
      }
      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.5;
      }
    `,
  ],
})
export class HomeComponent {}

