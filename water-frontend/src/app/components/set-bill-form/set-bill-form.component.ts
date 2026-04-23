import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-set-bill-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="f-container">
      <div class="f-header">
        <div class="header-icon ico-bill">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
          </svg>
        </div>
        <div class="header-txt">
          <h3>Set Total Bill</h3>
          <p>Enter bill amount from DAWASA</p>
        </div>
      </div>
      
      <form (ngSubmit)="onSubmit()" class="f-body">
        <div class="field-wrap">
          <label>Target Month</label>
          <select [(ngModel)]="month" name="month" (change)="onMonthChange()" required>
            @for (m of months; track m) {
              <option [value]="m">{{ m }}</option>
            }
          </select>
        </div>
        
        <div class="field-wrap">
          <label>Total Bill Amount (TZS)</label>
          <input type="number" [(ngModel)]="totalBill" name="totalBill" required min="1" placeholder="Enter amount from DAWASA">
        </div>

        <div class="field-wrap">
          <label>Total Current Units (Main Meter)</label>
          <input type="number" [(ngModel)]="totalUnits" name="totalUnits" required min="1" placeholder="Enter total units on main meter">
          <span class="field-hint">Used to calculate price per unit proportional to house usage</span>
        </div>
        
        @if (currentBill > 0) {
          <div class="current-badge">
            <div class="badge-content">
              <span class="label">Current Set:</span>
              <span class="val">{{ currentBill | number:'1.0-0' }} TZS</span>
            </div>
          </div>
        }
        
        <button type="submit" [disabled]="!totalBill || totalBill <= 0 || saving()" class="btn-primary">
          @if (saving()) { <span class="loader"></span> } 
          @else { {{ currentBill > 0 ? 'Update Bill Amount' : 'Confirm Bill Amount' }} }
        </button>
      </form>
    </div>
  `,
  styles: [`
    .f-container { background: white; width: 100%; }
    .f-header { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .header-icon { width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: #f59e0b; color: white; }
    .header-icon.ico-bill { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .header-txt h3 { font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0; }
    .header-txt p { font-size: 0.85rem; color: #64748b; margin: 2px 0 0; }
    
    .f-body { display: flex; flex-direction: column; gap: 16px; }
    .field-wrap label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
    select, input { width: 100%; padding: 12px 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; color: #1e293b; box-sizing: border-box; transition: all 0.2s; }
    select:focus, input:focus { outline: none; border-color: #f59e0b; background: white; box-shadow: 0 0 0 4px rgba(245,158,11,0.1); }
    
    .current-badge { padding: 12px 16px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; margin-top: 4px; }
    .badge-content { display: flex; justify-content: space-between; align-items: center; }
    .current-badge .label { font-size: 0.85rem; color: #9a3412; font-weight: 600; }
    .current-badge .val { font-size: 1rem; font-weight: 800; color: #c2410c; }
    
    .btn-primary { 
      width: 100%; padding: 14px; background: linear-gradient(135deg, #f59e0b, #d97706); 
      color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 800; 
      cursor: pointer; margin-top: 8px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(245,158,11,0.3);
    }
    .btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(245,158,11,0.4); }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled { background: #cbd5e1; cursor: not-allowed; box-shadow: none; }
    
    .loader { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .field-hint { display: block; font-size: 0.75rem; color: #64748b; font-weight: 600; margin-top: 6px; }
  `]
})
export class SetBillFormComponent implements OnInit {
  @Input() currentUser: any = null;
  @Output() billSet = new EventEmitter<void>();

  month: string = 'April';
  totalBill: number | null = null;
  totalUnits: number | null = null;
  currentBill: number = 0;
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  saving = () => false;

  constructor(private waterService: WaterService) { }

  ngOnInit() {
    const currentMonthIndex = new Date().getMonth();
    this.month = this.months[currentMonthIndex];
    this.loadCurrentBill();
  }

  onMonthChange() {
    this.loadCurrentBill();
  }

  loadCurrentBill() {
    this.waterService.getDashboard(this.month).subscribe(data => {
      this.currentBill = data.totalBill || 0;
      this.totalBill = this.currentBill > 0 ? this.currentBill : null;
      this.totalUnits = data.totalUnits || null;
    });
  }

  onSubmit() {
    if (this.totalBill && this.totalBill > 0) {
      this.saving = () => true;
      this.waterService.setBill(this.month, this.totalBill, this.totalUnits).subscribe({
        next: () => {
          this.saving = () => false;
          this.currentBill = this.totalBill!;
          this.billSet.emit();
        },
        error: () => { this.saving = () => false; }
      });
    }
  }
}