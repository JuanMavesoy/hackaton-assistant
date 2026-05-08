import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-cta-actions',
  template: `
    <div class="row">
      <button class="btn" type="button" (click)="goDonate()">Aportar ahora</button>
    </div>
  `,
  styles: [
    `
      .row {
        display: grid;
        grid-template-columns: 1fr;
        gap: 10px;
      }
      .btn {
        height: 42px;
        border-radius: 12px;
        border: 0;
        cursor: pointer;
        font-weight: 900;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #071021;
      }
      .btn:active {
        transform: translateY(1px);
      }
    `,
  ],
})
export class CtaActionsComponent {
  constructor(private readonly router: Router) {}

  goDonate() {
    this.router.navigateByUrl('/donate-mock');
  }
}

