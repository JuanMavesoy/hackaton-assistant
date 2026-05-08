import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DatePipe } from '@angular/common';

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  at: number;
};

@Component({
  standalone: true,
  selector: 'app-chat-window',
  imports: [DatePipe],
  template: `
    <div class="wrap">
      <div class="messages" #scrollEl>
        @for (m of messages; track m.id) {
          <div class="msg" [class.msg--user]="m.role === 'user'">
            <div class="bubble">
              <div class="text">{{ m.text }}</div>
              <div class="meta">{{ m.at | date: 'shortTime' }}</div>
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
          (input)="draft = ($any($event.target).value ?? '')"
          (keydown.enter)="submit()"
        />
        <button class="btn" type="button" (click)="submit()">Enviar</button>
        <button class="btn btn--ghost" type="button" (click)="sendVoice.emit()" [disabled]="listening">
          {{ listening ? 'Escuchando…' : '🎤' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .wrap {
        display: grid;
        grid-template-rows: 1fr auto;
        height: 100%;
      }
      .messages {
        padding: 12px 12px 6px;
        overflow: auto;
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
      }
      .msg--user .bubble {
        background: linear-gradient(135deg, rgba(124, 92, 255, 0.35), rgba(53, 208, 255, 0.22));
        border-color: rgba(124, 92, 255, 0.35);
      }
      .text {
        line-height: 1.35;
        white-space: pre-wrap;
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
export class ChatWindowComponent {
  @Input({ required: true }) messages: ChatMessage[] = [];
  @Input() listening = false;

  @Output() sendText = new EventEmitter<string>();
  @Output() sendVoice = new EventEmitter<void>();

  @ViewChild('scrollEl') scrollEl?: ElementRef<HTMLDivElement>;

  draft = '';

  ngAfterViewChecked() {
    const el = this.scrollEl?.nativeElement;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }

  submit() {
    const value = this.draft.trim();
    if (!value) return;
    this.sendText.emit(value);
    this.draft = '';
  }
}

