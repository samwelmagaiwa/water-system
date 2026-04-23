import { Component, EventEmitter, OnInit, Output, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-payment-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-shell">
      <div class="form-top">
        <div class="ico-ring pay-grad">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <div class="top-info">
          <h3>Record Payment</h3>
          <p>Register payment received from tenant</p>
        </div>
      </div>
      
      <form (ngSubmit)="onSubmit()" class="form-body">
        @if (currentUser) {
          <div class="user-chip pay-bg">
            <div class="u-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span class="u-label">{{ currentUser.name }}</span>
          </div>
        }

        <div class="input-wrap">
          <label>Target Month</label>
          <select [(ngModel)]="month" name="month" (change)="onMonthChange()" required class="field-select">
            @for (m of months; track m) {
              <option [value]="m">{{ m }}</option>
            }
          </select>
        </div>
        
        <div class="input-wrap">
          <label>Total Paid for {{ month }} (TZS)</label>
          <div class="input-with-action">
            <input type="number" [(ngModel)]="amount" name="amount" (ngModelChange)="validateAmount()" required min="0" step="100" placeholder="Enter total TZS paid" [class.field-err]="errorMsg()">
            <button type="button" class="action-btn-inline" (click)="payAll()" [disabled]="!maxAmount">Full Bill</button>
          </div>
          @if (maxAmount !== null) {
            <div class="hint-stack">
              <span class="hint-label">Total Monthly Bill: <strong>{{ maxAmount | number }} TZS</strong></span>
              @if (isCorrection) {
                <span class="hint-label success">✓ Existing Payment Found (Editing)</span>
              }
            </div>
          }
        </div>
        
        @if (errorMsg()) {
          <div class="err-box">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <span>{{ errorMsg() }}</span>
          </div>
        }
        
        <button type="submit" [disabled]="!currentUser || !amount || errorMsg() || loading()" class="submit-btn pay-btn">
          @if (loading()) { <span class="spinner"></span> }
          @else { Confirm Payment }
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-shell { background: white; width: 100%; }
    .form-top { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .ico-ring { width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
    .pay-grad { background: linear-gradient(135deg, #10b981, #059669); }
    .top-info h3 { font-size: 1.15rem; font-weight: 800; color: #1e293b; margin: 0; }
    .top-info p { font-size: 0.85rem; color: #64748b; margin: 2px 0 0; }
    
    .form-body { display: flex; flex-direction: column; gap: 16px; }
    .user-chip { display: flex; align-items: center; gap: 10px; padding: 12px 16px; border-radius: 8px; margin-bottom: 4px; }
    .pay-bg { background: #ecfdf5; border: 1px solid #10b981; }
    .u-icon { color: #065f46; }
    .u-label { font-size: 0.95rem; font-weight: 700; color: #064e3b; }
    
    .input-wrap label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
    input, .field-select { width: 100%; padding: 12px 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; color: #1e293b; box-sizing: border-box; transition: border-color 0.2s; }
    input:focus, .field-select:focus { outline: none; border-color: #10b981; }
    
    .input-with-action { position: relative; display: flex; align-items: center; }
    .action-btn-inline { position: absolute; right: 8px; padding: 6px 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .action-btn-inline:hover { background: #059669; transform: translateY(-1px); }
    .action-btn-inline:disabled { background: #cbd5e1; cursor: not-allowed; }

    .hint-label { display: block; font-size: 0.75rem; color: #64748b; margin-top: 6px; font-weight: 500; }
    .hint-label.success { color: #059669; }
    .hint-stack { display: flex; flex-direction: column; gap: 2px; }
    .err-box { display: flex; align-items: center; gap: 8px; background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; margin-top: 4px; }
    .err-box svg { width: 16px; height: 16px; }

    .submit-btn { width: 100%; padding: 14px; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 700; cursor: pointer; margin-top: 8px; transition: all 0.2s; position: relative; }
    .pay-btn { background: linear-gradient(135deg, #10b981, #059669); }
    .submit-btn:disabled { background: #cbd5e1; cursor: not-allowed; box-shadow: none; }

    .spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class PaymentFormComponent implements OnInit {
  @Input() currentUser: any = null;
  @Output() paymentAdded = new EventEmitter<void>();
  
  amount: number | null = null;
  maxAmount: number | null = null;
  isCorrection = false;
  month: string = 'March';
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  errorMsg = signal('');
  loading = signal(false);
  
  constructor(private waterService: WaterService) { }
  
  ngOnInit() {
    const currentMonthIndex = new Date().getMonth();
    this.month = this.months[currentMonthIndex];
    this.fetchMaxAmount();
  }

  onMonthChange() {
    this.fetchMaxAmount();
  }

  fetchMaxAmount() {
    if (!this.currentUser) return;
    const tid = this.currentUser.id || this.currentUser.tenantId;
    this.waterService.getTenantSummary(this.month).subscribe(tenants => {
      const self = tenants.find(t => t.id === tid || t.tenantId === tid);
      if (self) {
        this.maxAmount = self.cost || 0;
        this.amount = self.paid || 0;
        this.isCorrection = (self.paid > 0);
        this.validateAmount();
      }
    });
  }

  payAll() {
    if (this.maxAmount !== null) {
      this.amount = this.maxAmount;
      this.validateAmount();
    }
  }

  validateAmount() {
    if (this.amount && this.maxAmount !== null && this.amount > this.maxAmount) {
      this.errorMsg.set(`Amount should not exceed the total monthly bill: ${this.maxAmount.toLocaleString()} TZS.`);
    } else {
      this.errorMsg.set('');
    }
  }

  onSubmit() {
    if (this.currentUser && this.amount && !this.errorMsg()) {
      this.loading.set(true);
      this.waterService.addPayment({
        tenantId: this.currentUser.id || this.currentUser.tenantId,
        amount: this.amount,
        month: this.month
      }).subscribe({
        next: () => {
          this.amount = null;
          this.loading.set(false);
          this.paymentAdded.emit();
        },
        error: () => {
          this.loading.set(false);
          this.errorMsg.set('Failed to register payment.');
        }
      });
    }
  }
}