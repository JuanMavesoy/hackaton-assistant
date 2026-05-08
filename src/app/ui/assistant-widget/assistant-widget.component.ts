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
          [speaking]="
            state() === 'speaking' ||
            state() === 'listening' ||
            state() === 'thinking'
          "
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

  constructor(
    private readonly assistantApi: AssistantApiService
  ) {}

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

    this.currentText.set(
      'Déjame revisar cuál opción puede ajustarse mejor para ti...'
    );

    this.assistantApi.send(text).subscribe({
      next: async (res) => {
        await this.typeText(res.message);

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

  private async typeText(text: string) {
    this.currentText.set('');

    for (let i = 0; i < text.length; i++) {
      this.currentText.update((value) => value + text[i]);

      await new Promise((resolve) =>
        setTimeout(resolve, 12)
      );
    }
  }

  private async speak(text: string) {
    if (!('speechSynthesis' in window)) {
      this.state.set('idle');
      return;
    }

    window.speechSynthesis.cancel();

    const voices = await this.getVoices();

    const speechText = this.normalizeSpeechText(text);

    const utter = new SpeechSynthesisUtterance(speechText);

    utter.lang = 'es-CO';

    utter.rate = 0.9;
    utter.pitch = 1.16;
    utter.volume = 1;

    const preferredVoices = [
      'Microsoft Laura',
      'Microsoft Helena',
      'Microsoft Sabina',
      'Microsoft Dalia',
      'Paulina',
      'Sofia',
      'Elvira',
      'Helena',
      'Laura',
    ];

    const selectedVoice =
      voices.find((voice) =>
        preferredVoices.some((name) =>
          voice.name.toLowerCase().includes(name.toLowerCase())
        )
      ) ||
      voices.find(
        (voice) =>
          voice.lang.toLowerCase().includes('es') &&
          voice.name.toLowerCase().includes('female')
      ) ||
      voices.find((voice) =>
        voice.lang.toLowerCase().startsWith('es')
      );

    if (selectedVoice) {
      utter.voice = selectedVoice;

      console.log(
        '🎤 Voz seleccionada:',
        selectedVoice.name
      );
    }

    utter.onstart = () => {
      this.state.set('speaking');
    };

    utter.onend = () => {
      this.state.set('idle');
    };

    utter.onerror = () => {
      this.state.set('idle');
    };

    window.speechSynthesis.speak(utter);
  }

 private normalizeSpeechText(text: string): string {
  return text
    .replace(/\$([\d.]+)/g, (_match, amount) => {
      const numeric = Number(String(amount).replace(/\./g, ''));

      if (!Number.isFinite(numeric)) {
        return amount;
      }

      return `${this.moneyToWords(numeric)} de pesos`;
    })
    .replace(/\n/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
}

private moneyToWords(value: number): string {
  if (value === 180000000) return 'ciento ochenta millones';
  if (value === 1200000) return 'un millón doscientos mil';
  if (value === 200000) return 'doscientos mil';

  if (value >= 1000000 && value % 1000000 === 0) {
    const millions = value / 1000000;
    return `${this.basicNumberToWords(millions)} millones`;
  }

  if (value >= 1000 && value % 1000 === 0) {
    const thousands = value / 1000;
    return `${this.basicNumberToWords(thousands)} mil`;
  }

  return this.basicNumberToWords(value);
}

private basicNumberToWords(value: number): string {
  const map: Record<number, string> = {
    1: 'uno',
    2: 'dos',
    3: 'tres',
    4: 'cuatro',
    5: 'cinco',
    6: 'seis',
    7: 'siete',
    8: 'ocho',
    9: 'nueve',
    10: 'diez',
    20: 'veinte',
    30: 'treinta',
    40: 'cuarenta',
    50: 'cincuenta',
    60: 'sesenta',
    70: 'setenta',
    80: 'ochenta',
    90: 'noventa',
    100: 'cien',
    180: 'ciento ochenta',
    200: 'doscientos',
  };

  return map[value] ?? value.toString();
}

  private numberToSpanish(value: number): string {
    if (value === 0) return 'cero';

    const units = [
      '',
      'uno',
      'dos',
      'tres',
      'cuatro',
      'cinco',
      'seis',
      'siete',
      'ocho',
      'nueve',
    ];

    const specials: Record<number, string> = {
      10: 'diez',
      11: 'once',
      12: 'doce',
      13: 'trece',
      14: 'catorce',
      15: 'quince',
      20: 'veinte',
    };

    const tens = [
      '',
      '',
      'veinti',
      'treinta',
      'cuarenta',
      'cincuenta',
      'sesenta',
      'setenta',
      'ochenta',
      'noventa',
    ];

    const hundreds = [
      '',
      'ciento',
      'doscientos',
      'trescientos',
      'cuatrocientos',
      'quinientos',
      'seiscientos',
      'setecientos',
      'ochocientos',
      'novecientos',
    ];

    const convertBelowThousand = (num: number): string => {
      if (num === 0) return '';

      if (num === 100) return 'cien';

      if (num < 10) return units[num];

      if (specials[num]) return specials[num];

      if (num < 20) {
        return `dieci${units[num - 10]}`;
      }

      if (num < 30) {
        return num === 20
          ? 'veinte'
          : `veinti${units[num - 20]}`;
      }

      if (num < 100) {
        const ten = Math.floor(num / 10);
        const unit = num % 10;

        return unit === 0
          ? tens[ten]
          : `${tens[ten]} y ${units[unit]}`;
      }

      const hundred = Math.floor(num / 100);
      const rest = num % 100;

      return rest === 0
        ? hundreds[hundred]
        : `${hundreds[hundred]} ${convertBelowThousand(rest)}`;
    };

    const millions = Math.floor(value / 1_000_000);

    const thousands = Math.floor(
      (value % 1_000_000) / 1_000
    );

    const rest = value % 1_000;

    const parts: string[] = [];

    if (millions > 0) {
      parts.push(
        millions === 1
          ? 'un millón'
          : `${convertBelowThousand(millions)} millones`
      );
    }

    if (thousands > 0) {
      parts.push(
        thousands === 1
          ? 'mil'
          : `${convertBelowThousand(thousands)} mil`
      );
    }

    if (rest > 0) {
      parts.push(convertBelowThousand(rest));
    }

    return parts.join(' ');
  }

  private getVoices(): Promise<SpeechSynthesisVoice[]> {
    return new Promise((resolve) => {
      let voices = window.speechSynthesis.getVoices();

      if (voices.length) {
        resolve(voices);
        return;
      }

      window.speechSynthesis.onvoiceschanged = () => {
        voices = window.speechSynthesis.getVoices();

        resolve(voices);
      };
    });
  }

  private recognizeOnce(): Promise<string | null> {
    const AnyWindow = window as unknown as {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };

    const Ctor =
      AnyWindow.SpeechRecognition ??
      AnyWindow.webkitSpeechRecognition;

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
        const result =
          evt?.results?.[0]?.[0]?.transcript ?? '';

        done(result.trim() || null);
      };

      rec.onerror = () => done(null);

      rec.onend = () => {
        if (this.state() === 'listening') {
          done(null);
        }
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