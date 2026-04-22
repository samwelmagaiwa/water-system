import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-card">
      <div class="form-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div>
          <h3>Record Payment</h3>
          <p>Register tenant payment</p>
        </div>
      </div>
      
      <form (ngSubmit)="onSubmit()" class="form-fields">
        @if (currentUser) {
          <div class="user-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{{ currentUser.name }}</span>
          </div>
        }
        
        <div class="field-group">
          <label>Amount (TZS)</label>
          <input type="number" [(ngModel)]="amount" name="amount" required min="0" step="100" placeholder="Enter amount">
        </div>
        
        <button type="submit" [disabled]="!currentUser || !amount" class="submit-button">
          <span>Save Payment</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03);
    }
    .form-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 22px;
    }
    .header-icon {
      width: 46px;
      height: 46px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .header-icon svg {
      width: 22px;
      height: 22px;
      color: white;
    }
    .form-header h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .form-header p {
      font-size: 0.8rem;
      color: #64748b;
      margin: 2px 0 0;
    }
    
    .user-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 10px;
      margin-bottom: 16px;
      color: #065f46;
      font-weight: 500;
    }
    
    .field-group {
      margin-bottom: 16px;
    }
    .field-group label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
      margin-bottom: 6px;
    }
    input {
      width: 100%;
      padding: 12px 14px;
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 0.95rem;
      color: #1e293b;
      transition: all 0.2s;
      box-sizing: border-box;
    }
    input:focus {
      outline: none;
      border-color: #10b981;
      background: white;
      box-shadow: 0 0 0 3px rgba(16,185,129,0.1);
    }
    
    .submit-button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
      transition: all 0.2s;
    }
    .submit-button:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(16,185,129,0.35);
    }
    .submit-button:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .form-card {
        padding: 20px;
        border-radius: 16px;
      }
    }
  `]
})
export class PaymentFormComponent implements OnInit {
  @Input() currentUser: any = null;
  @Output() paymentAdded = new EventEmitter<void>();
  amount: number | null = null;

  constructor(private waterService: WaterService) { }

  ngOnInit() {}

  onSubmit() {
    if (this.currentUser && this.amount) {
      this.waterService.addPayment({
        tenantId: this.currentUser.id,
        amount: this.amount
      }).subscribe(() => {
        this.amount = null;
        this.paymentAdded.emit();
      });
    }
  }
}