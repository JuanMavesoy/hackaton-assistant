import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-avatar-view',
  template: `
    <div class="avatar" [class.avatar--speaking]="speaking" aria-hidden="true">
      <div class="ring"></div>
      <div class="face">
        <div class="eye"></div>
        <div class="eye"></div>
        <div class="mouth"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .avatar {
        width: 44px;
        height: 44px;
        border-radius: 999px;
        position: relative;
        display: grid;
        place-items: center;
      }
      .ring {
        position: absolute;
        inset: 0;
        border-radius: 999px;
        background: radial-gradient(circle at 30% 30%, rgba(53, 208, 255, 0.9), rgba(124, 92, 255, 0.7));
        filter: blur(0.2px);
        opacity: 0.95;
      }
      .face {
        width: 34px;
        height: 34px;
        border-radius: 999px;
        background: rgba(7, 16, 33, 0.65);
        border: 1px solid rgba(255, 255, 255, 0.14);
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr auto;
        align-items: center;
        justify-items: center;
        padding-top: 7px;
        gap: 2px 6px;
        position: relative;
        z-index: 1;
      }
      .eye {
        width: 6px;
        height: 6px;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.88);
      }
      .mouth {
        grid-column: 1 / span 2;
        width: 14px;
        height: 6px;
        border-radius: 0 0 10px 10px;
        border: 2px solid rgba(255, 255, 255, 0.78);
        border-top: 0;
        opacity: 0.9;
        margin-bottom: 6px;
      }
      .avatar--speaking .ring {
        animation: pulse 850ms ease-in-out infinite;
      }
      @keyframes pulse {
        0% {
          transform: scale(1);
          filter: blur(0.2px);
        }
        50% {
          transform: scale(1.08);
          filter: blur(0.6px);
        }
        100% {
          transform: scale(1);
          filter: blur(0.2px);
        }
      }
    `,
  ],
})
export class AvatarViewComponent {
  @Input() speaking = false;
}

