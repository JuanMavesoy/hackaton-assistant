import { Component, Input } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-avatar-view',
  template: `
    <div class="avatar" [class.avatar--speaking]="speaking" aria-hidden="true">
      <div class="ring"></div>

      <div class="avatar-img"></div>
    </div>
  `,
  styles: [
    `
      .avatar {
        width: 108px;
        height: 108px;
        border-radius: 999px;
        position: relative;
        display: grid;
        place-items: center;
        flex: 0 0 auto;
      }

      .ring {
        position: absolute;
        inset: -5px;
        border-radius: 999px;

        background: radial-gradient(
          circle at 30% 30%,
          rgba(53, 208, 255, 0.95),
          rgba(124, 92, 255, 0.75)
        );

        filter: blur(0.4px);

        opacity: 0.95;

        z-index: 1;
      }

      .avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 999px;

        position: relative;
        z-index: 2;

        background-image: url('/sofia.png');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;

        border: 3px solid rgba(255, 255, 255, 0.72);

        box-shadow:
          0 16px 36px rgba(0, 0, 0, 0.38),
          0 0 0 8px rgba(53, 208, 255, 0.12);

        transition:
          transform 0.25s ease,
          box-shadow 0.25s ease;
      }

      .avatar--speaking .avatar-img {
        animation: avatarBreath 900ms ease-in-out infinite;
      }

      .avatar--speaking .ring {
        animation: pulse 850ms ease-in-out infinite;
      }

      @keyframes avatarBreath {
        0%,
        100% {
          transform: scale(1);
        }

        50% {
          transform: scale(1.035);
        }
      }

      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 0.55;
        }

        50% {
          transform: scale(1.12);
          opacity: 0.95;
        }

        100% {
          transform: scale(1);
          opacity: 0.55;
        }
      }
    `,
  ],
})
export class AvatarViewComponent {
  @Input() speaking = false;
}