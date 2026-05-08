import { Component, signal } from '@angular/core';
import { AvatarViewComponent } from '../avatar-view/avatar-view.component';
import { ChatWindowComponent, ChatMessage } from '../chat-window/chat-window.component';
import { CtaActionsComponent } from '../cta-actions/cta-actions.component';

@Component({
  standalone: true,
  selector: 'app-assistant-widget',
  imports: [AvatarViewComponent, ChatWindowComponent, CtaActionsComponent],
  template: `
    <button class="fab" type="button" (click)="toggle()" [attr.aria-expanded]="isOpen()">
      <span class="dot" aria-hidden="true"></span>
      <span class="label">{{ isOpen() ? 'Cerrar' : 'Asistente' }}</span>
    </button>

    @if (isOpen()) {
      <section class="panel" role="dialog" aria-label="Asistente">
        <header class="panel__header">
          <app-avatar-view [speaking]="speaking()" />
          <div class="title">
            <div class="title__name">Asistente</div>
            <div class="title__hint">Texto + voz · demo hackatón</div>
          </div>
          <button class="icon" type="button" (click)="toggle()" aria-label="Cerrar">✕</button>
        </header>

        <app-chat-window
          [messages]="messages()"
          (sendText)="onSendText($event)"
          (sendVoice)="onSendVoice()"
          [listening]="listening()"
        />

        <footer class="panel__footer">
          <app-cta-actions />
        </footer>
      </section>
    }
  `,
  styles: [
    `
      .fab {
        position: fixed;
        right: 18px;
        bottom: 18px;
        height: 52px;
        padding: 0 16px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: linear-gradient(135deg, rgba(124, 92, 255, 0.85), rgba(53, 208, 255, 0.55));
        color: #071021;
        font-weight: 800;
        box-shadow: var(--shadow);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .dot {
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: rgba(7, 16, 33, 0.6);
      }
      .panel {
        position: fixed;
        right: 18px;
        bottom: 86px;
        width: min(420px, calc(100vw - 36px));
        height: min(640px, calc(100vh - 120px));
        border-radius: var(--radius);
        background: rgba(10, 16, 32, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.16);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow);
        overflow: hidden;
        display: grid;
        grid-template-rows: auto 1fr auto;
      }
      .panel__header {
        padding: 14px 14px 12px;
        display: grid;
        grid-template-columns: auto 1fr auto;
        gap: 12px;
        align-items: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.08),
          rgba(255, 255, 255, 0.02)
        );
      }
      .title__name {
        font-weight: 800;
        letter-spacing: -0.01em;
      }
      .title__hint {
        font-size: 12px;
        color: var(--muted);
      }
      .icon {
        width: 36px;
        height: 36px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.06);
        color: var(--text);
        cursor: pointer;
      }
      .panel__footer {
        border-top: 1px solid rgba(255, 255, 255, 0.12);
        padding: 10px 12px;
        background: rgba(255, 255, 255, 0.04);
      }
    `,
  ],
})
export class AssistantWidgetComponent {
  readonly isOpen = signal(false);
  readonly messages = signal<ChatMessage[]>([
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      text: 'Hola. Soy tu asistente demo. Escribe un mensaje o usa el micrófono.',
      at: Date.now(),
    },
  ]);

  readonly listening = signal(false);
  readonly speaking = signal(false);

  toggle() {
    this.isOpen.update((v) => !v);
  }

  onSendText(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    this.append({ role: 'user', text: trimmed });
    this.respondMock(trimmed);
  }

  async onSendVoice() {
    const recognized = await this.recognizeOnce();
    if (!recognized) return;
    this.onSendText(recognized);
  }

  private append(msg: { role: 'user' | 'assistant'; text: string }) {
    this.messages.update((m) => [
      ...m,
      { id: crypto.randomUUID(), role: msg.role, text: msg.text, at: Date.now() },
    ]);
  }

  private respondMock(userText: string) {
    const reply =
      userText.toLowerCase().includes('aportar') || userText.toLowerCase().includes('donar')
        ? 'Si quieres aportar, toca “Aportar ahora” abajo. (Es una redirección mock por ahora).'
        : `Entendido. (Respuesta mock) Dijiste: “${userText}”. ¿Quieres que lo pasemos a voz?`;

    this.append({ role: 'assistant', text: reply });
    this.speak(reply);
  }

  private speak(text: string) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'es-ES';
    utter.rate = 1.03;
    utter.onstart = () => this.speaking.set(true);
    utter.onend = () => this.speaking.set(false);
    utter.onerror = () => this.speaking.set(false);
    window.speechSynthesis.speak(utter);
  }

  private recognizeOnce(): Promise<string | null> {
    const AnyWindow = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const Ctor = AnyWindow.SpeechRecognition ?? AnyWindow.webkitSpeechRecognition;
    if (!Ctor) {
      this.append({
        role: 'assistant',
        text: 'Tu navegador no soporta SpeechRecognition. Prueba Chrome o Edge.',
      });
      return Promise.resolve(null);
    }

    return new Promise((resolve) => {
      const rec = new Ctor();
      rec.lang = 'es-ES';
      rec.interimResults = false;
      rec.maxAlternatives = 1;

      const done = (value: string | null) => {
        this.listening.set(false);
        resolve(value);
      };

      rec.onresult = (evt: any) => {
        const text = evt?.results?.[0]?.[0]?.transcript ?? '';
        done(text.trim() || null);
      };
      rec.onerror = () => done(null);
      rec.onend = () => {
        if (this.listening()) done(null);
      };

      this.listening.set(true);
      try {
        rec.start();
      } catch {
        done(null);
      }
    });
  }
}

