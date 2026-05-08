import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Simulation } from '../../core/models/chat.models';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: number;
  recommendedProduct?: string;
  simulation?: Simulation | null;
  showCta?: boolean;
  cta?: string;
};

@Component({
  standalone: true,
  selector: 'app-chat-window',
  imports: [CommonModule, DatePipe],
  template: `
    <div class="wrap">
      <div class="messages" #scrollEl>
        @for (m of messages; track m.id) {
          <div class="msg" [class.msg--user]="m.role === 'user'">
            <div class="bubble">
              <div class="text">{{ m.text }}</div>

              @if (m.recommendedProduct) {
                <div class="product">
                  Producto recomendado:
                  <strong>{{ m.recommendedProduct }}</strong>
                </div>
              }

              @if (m.simulation) {
                <div class="simulation">
                  <span>
                    Aporte mensual:
                    {{ m.simulation.monthlyAmount | currency:'COP':'symbol':'1.0-0' }}
                  </span>
                  <span>Meses: {{ m.simulation.months }}</span>
                  <strong>
                    Total estimado:
                    {{ m.simulation.estimatedSavings | currency:'COP':'symbol':'1.0-0' }}
                  </strong>
                </div>
              }

              <div class="meta">{{ m.at | date: 'shortTime' }}</div>
            </div>
          </div>
        }

        @if (loading) {
          <div class="msg">
            <div class="bubble bubble--loading">
              <div class="text">SofIA está pensando...</div>
            </div>
          </div>
        }
      </div>

      <div class="composer">
        <input
          class="input"
          type="text"
          placeholder="Escribe tu mensaje…"
          [value]="draft"
          [disabled]="loading"
          (input)="draft = ($any($event.target).value ?? '')"
          (keydown.enter)="submit()"
        />

        <button class="btn" type="button" (click)="submit()" [disabled]="loading || !draft.trim()">
          Enviar
        </button>

        <button
          class="btn btn--ghost"
          type="button"
          (click)="sendVoice.emit()"
          [disabled]="listening || loading"
        >
          {{ listening ? 'Escuchando…' : '🎤' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        display: grid;
        grid-template-rows: minmax(0, 1fr) auto;
        height: 100%;
        min-height: 0;
        overflow: hidden;
      }

      .messages {
        padding: 12px 12px 6px;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;
        max-height: 100%;
        overscroll-behavior: contain;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .msg {
        display: flex;
        justify-content: flex-start;
      }

      .msg--user {
        justify-content: flex-end;
      }

      .bubble {
        max-width: 82%;
        padding: 10px 12px;
        border-radius: 14px;
        background: rgba(255, 255, 255, 0.08);
        border: 1px solid rgba(255, 255, 255, 0.12);
        word-break: break-word;
      }

      .bubble--loading {
        opacity: 0.75;
      }

      .msg--user .bubble {
        background: linear-gradient(
          135deg,
          rgba(124, 92, 255, 0.35),
          rgba(53, 208, 255, 0.22)
        );
        border-color: rgba(124, 92, 255, 0.35);
      }

      .text {
        line-height: 1.35;
        white-space: pre-wrap;
      }

      .product,
      .simulation {
        margin-top: 10px;
        padding: 10px;
        border-radius: 12px;
        display: grid;
        gap: 4px;
        background: rgba(255, 255, 255, 0.08);
        font-size: 12px;
      }

      .product strong,
      .simulation strong {
        color: #ffffff;
      }

      .meta {
        margin-top: 6px;
        font-size: 11px;
        color: var(--muted);
      }

      .composer {
        padding: 10px 12px 12px;
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 8px;
        background: rgba(10, 16, 32, 0.92);
      }

      .input {
        height: 44px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.06);
        color: var(--text);
        padding: 0 12px;
        outline: none;
      }

      .input:focus {
        border-color: rgba(53, 208, 255, 0.55);
        box-shadow: 0 0 0 3px rgba(53, 208, 255, 0.12);
      }

      .input:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .btn {
        height: 44px;
        padding: 0 12px;
        border-radius: 12px;
        border: 0;
        cursor: pointer;
        font-weight: 800;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #071021;
      }

      .btn--ghost {
        background: rgba(255, 255, 255, 0.06);
        border: 1px solid rgba(255, 255, 255, 0.14);
        color: var(--text);
        font-weight: 700;
      }

      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class ChatWindowComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) messages: ChatMessage[] = [];
  @Input() listening = false;
  @Input() loading = false;

  @Output() sendText = new EventEmitter<string>();
  @Output() sendVoice = new EventEmitter<void>();

  @ViewChild('scrollEl') scrollEl?: ElementRef<HTMLDivElement>;

  draft = '';

  ngAfterViewInit() {
    this.scrollToBottom();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['messages'] || changes['loading']) {
      setTimeout(() => this.scrollToBottom(), 0);
    }
  }

  submit() {
    const value = this.draft.trim();

    if (!value || this.loading) return;

    this.sendText.emit(value);
    this.draft = '';
  }

  private scrollToBottom() {
    const el = this.scrollEl?.nativeElement;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    });
  }
}