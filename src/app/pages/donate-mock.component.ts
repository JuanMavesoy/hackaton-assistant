import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-donate-mock',
  imports: [RouterLink],
  template: `
    <main class="page">
      <a routerLink="/" class="back">← Volver</a>
      <h2>Aportar ahora (mock)</h2>
      <p>Acá podrías integrar Stripe/MercadoPago/etc. Por ahora es una pantalla placeholder.</p>
      <div class="card">
        <div class="row"><span>Monto sugerido</span><strong>$10</strong></div>
        <button class="btn" type="button" (click)="onMockPay()">Simular aporte</button>
      </div>
    </main>
  `,
  styles: [
    `
      .page {
        min-height: 100%;
        max-width: 920px;
        margin: 0 auto;
        padding: 48px 20px;
      }
      .back {
        display: inline-block;
        margin-bottom: 18px;
        color: var(--muted);
        text-decoration: none;
      }
      .card {
        margin-top: 16px;
        padding: 18px;
        border-radius: var(--radius);
        background: var(--panel);
        border: 1px solid rgba(255, 255, 255, 0.14);
        box-shadow: var(--shadow);
        max-width: 420px;
      }
      .row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .btn {
        width: 100%;
        height: 44px;
        border: 0;
        border-radius: 12px;
        background: linear-gradient(135deg, var(--brand), var(--brand-2));
        color: #071021;
        font-weight: 700;
        cursor: pointer;
      }
      .btn:active {
        transform: translateY(1px);
      }
      p {
        color: var(--muted);
        line-height: 1.5;
      }
    `,
  ],
})
export class DonateMockComponent {
  onMockPay() {
    alert('Aporte simulado. ¡Gracias!');
  }
}

