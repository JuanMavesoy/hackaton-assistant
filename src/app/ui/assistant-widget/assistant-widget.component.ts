import { Component, signal } from '@angular/core';
import { AssistantApiService } from '../../services/assistant-api.service';
import { CtaActionsComponent } from '../cta-actions/cta-actions.component';
import { AvatarViewComponent } from '../avatar-view/avatar-view.component';

type ConversationState = 'idle' | 'listening' | 'thinking' | 'speaking';

@Component({
  standalone: true,
  selector: 'app-assistant-widget',
  imports: [CtaActionsComponent, AvatarViewComponent],
  template: `
    <section class="sofia-widget">
      <button class="avatar-card" type="button" (click)="startConversation()">
        <app-avatar-view
          [speaking]="state() === 'speaking' || state() === 'listening'"
        />

        <div class="info">
          <strong>SofIA</strong>
          <span>{{ statusText() }}</span>
        </div>
      </button>

      @if (isOpen()) {
        <div class="assistant-panel">
          <div class="caption">
            {{ currentText() }}
          </div>

          @if (showCta()) {
            <app-cta-actions />
          }

          <div class="actions">
            <button
              type="button"
              (click)="startConversation()"
              [disabled]="state() === 'thinking'"
            >
              🎤 Hablar
            </button>

            <button type="button" (click)="stopAll()">
              Detener
            </button>
          </div>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .sofia-widget {
        position: fixed;
        right: 24px;
        bottom: 24px;
        z-index: 100;
        width: 360px;
        max-width: calc(100vw - 32px);
        font-family: Inter, system-ui, sans-serif;
      }

      .avatar-card {
        width: 100%;
        border: 1px solid rgba(255, 255, 255, 0.14);
        border-radius: 30px;
        padding: 20px;
        background: linear-gradient(
          135deg,
          rgba(124, 92, 255, 0.28),
          rgba(53, 208, 255, 0.12)
        );
        color: white;
        display: flex;
        align-items: center;
        gap: 18px;
        cursor: pointer;
        box-shadow:
          0 24px 60px rgba(0, 0, 0, 0.35),
          inset 0 1px 0 rgba(255, 255, 255, 0.05);
        backdrop-filter: blur(18px);
        transition:
          transform 0.25s ease,
          box-shadow 0.25s ease,
          border-color 0.25s ease;
      }

      .avatar-card:hover {
        transform: translateY(-3px);
        box-shadow:
          0 32px 70px rgba(0, 0, 0, 0.42),
          0 0 0 1px rgba(255, 255, 255, 0.06);
        border-color: rgba(53, 208, 255, 0.35);
      }

      .info {
        display: grid;
        text-align: left;
      }

      .info strong {
        font-size: 26px;
        line-height: 1;
      }

      .info span {
        margin-top: 6px;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.75);
      }

      .assistant-panel {
        margin-top: 14px;
        padding: 18px;
        border-radius: 28px;
        background: linear-gradient(
          180deg,
          rgba(10, 16, 32, 0.94),
          rgba(10, 16, 32, 0.86)
        );
        border: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(18px);
      }

      .caption {
        min-height: 72px;
        color: white;
        line-height: 1.45;
        font-size: 15px;
        margin-bottom: 14px;
      }

      .actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 12px;
      }

      .actions button {
        height: 42px;
        border: 0;
        border-radius: 14px;
        cursor: pointer;
        font-weight: 800;
        background: rgba(255, 255, 255, 0.08);
        color: white;
      }

      .actions button:first-child {
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #071021;
      }

      .actions button:disabled {
        opacity: 0.55;
        cursor: not-allowed;
      }
    `,
  ],
})
export class AssistantWidgetComponent {
  readonly isOpen = signal(false);
  readonly state = signal<ConversationState>('idle');
  readonly currentText = signal(
    'Tócame para empezar. Soy SofIA, tu asesora digital de ahorro.'
  );
  readonly showCta = signal(false);

  constructor(private readonly assistantApi: AssistantApiService) {}

  statusText() {
    switch (this.state()) {
      case 'listening':
        return 'Te estoy escuchando...';
      case 'thinking':
        return 'Estoy analizando tu meta...';
      case 'speaking':
        return 'Te estoy respondiendo...';
      default:
        return 'Toca para hablar';
    }
  }

  async startConversation() {
    this.isOpen.set(true);
    this.showCta.set(false);

    const text = await this.recognizeOnce();

    if (!text) {
      this.currentText.set(
        'No alcancé a escucharte. Toca el micrófono e inténtalo de nuevo.'
      );
      return;
    }

    this.currentText.set(`Escuché: “${text}”`);
    this.state.set('thinking');

    this.assistantApi.send(text).subscribe({
      next: (res) => {
        this.currentText.set(res.message);
        this.showCta.set(res.showCta);

        if (res.speakResponse) {
          this.speak(res.message);
        } else {
          this.state.set('idle');
        }
      },
      error: () => {
        const fallback =
          'Tuve un problema conectándome con SofIA. Verifica que la API esté encendida.';
        this.currentText.set(fallback);
        this.speak(fallback);
      },
    });
  }

  stopAll() {
    window.speechSynthesis.cancel();
    this.state.set('idle');
  }

  private speak(text: string) {
    if (!('speechSynthesis' in window)) {
      this.state.set('idle');
      return;
    }

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-CO';
    utter.rate = 1.02;
    utter.pitch = 1.08;

    utter.onstart = () => this.state.set('speaking');
    utter.onend = () => this.state.set('idle');
    utter.onerror = () => this.state.set('idle');

    window.speechSynthesis.speak(utter);
  }

  private recognizeOnce(): Promise<string | null> {
    const AnyWindow = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };

    const Ctor =
      AnyWindow.SpeechRecognition ?? AnyWindow.webkitSpeechRecognition;

    if (!Ctor) {
      this.currentText.set(
        'Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.'
      );
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const rec = new Ctor();

      rec.lang = 'es-CO';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      const done = (value: string | null) => {
        this.state.set('idle');
        resolve(value);
      };

      rec.onresult = (evt: any) => {
        const result = evt?.results?.[0]?.[0]?.transcript ?? '';
        done(result.trim() || null);
      };

      rec.onerror = () => done(null);

      rec.onend = () => {
        if (this.state() === 'listening') done(null);
      };

      this.state.set('listening');

      try {
        rec.start();
      } catch {
        done(null);
      }
    });
  }
}