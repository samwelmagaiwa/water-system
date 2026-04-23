import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-add-units-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-core">
      <div class="form-head">
        <div class="ico-box usage-bg">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
        </div>
        <div class="head-info">
          <h3>Record Usage</h3>
          <p>Add water units consumed by tenant</p>
        </div>
      </div>
      
      <form (ngSubmit)="onSubmit()" class="form-body">
        @if (currentUser) {
          <div class="user-chip">
            <div class="u-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <span class="u-name">{{ currentUser.name }}</span>
          </div>
        }
        
        <div class="field-item">
          <label>Target Month</label>
          <select [(ngModel)]="month" name="month" (change)="onMonthChange()" required>
            @for (m of months; track m) {
              <option [value]="m">{{ m }}</option>
            }
          </select>
        </div>

        @if (previousUnits !== null) {
          <div class="history-chip">
            <div class="h-inner">
              <span class="h-label">Last Month Usage:</span>
              <span class="h-val">{{ previousUnits }} Units</span>
            </div>
          </div>
        }
        
        <div class="field-item">
          <label>Current Total Units (Meter Reading)</label>
          <input type="number" [(ngModel)]="units" name="units" required [min]="previousUnits || 0" placeholder="Enter total units on meter">
          @if (currentUnits > 0) {
            <span class="input-hint">Existing record: {{ currentUnits }} units</span>
          }
          @if (units !== null && previousUnits !== null && units < previousUnits) {
            <span class="error-hint">Warning: Total units cannot be less than previous ({{ previousUnits }})</span>
          }
        </div>
        
        <button type="submit" [disabled]="!currentUser || units === null || saving" class="submit-btn primary-bg">
          @if (saving) { <span class="spinner"></span> }
          @else { {{ currentUnits > 0 ? 'Update Usage Record' : 'Save Usage Record' }} }
        </button>
      </form>
    </div>
  `,
  styles: [`
    .form-core { background: white; width: 100%; }
    .form-head { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; }
    .ico-box { width: 44px; height: 44px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; }
    .usage-bg { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .head-info h3 { font-size: 1.15rem; font-weight: 800; color: #1e293b; margin: 0; }
    .head-info p { font-size: 0.85rem; color: #64748b; margin: 2px 0 0; }
    
    .form-body { display: flex; flex-direction: column; gap: 16px; }
    .user-chip { display: flex; align-items: center; gap: 10px; padding: 12px 16px; background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; margin-bottom: 4px; }
    .u-icon { color: #4338ca; }
    .u-name { font-size: 0.95rem; font-weight: 700; color: #312e81; }

    .history-chip { padding: 10px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-top: -4px; border-left: 4px solid #3b82f6; }
    .h-inner { display: flex; justify-content: space-between; align-items: center; }
    .h-label { font-size: 0.8rem; font-weight: 700; color: #64748b; }
    .h-val { font-size: 0.9rem; font-weight: 800; color: #1e40af; }
    
    .field-item label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
    select, input { width: 100%; padding: 12px 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 1rem; color: #1e293b; box-sizing: border-box; transition: all 0.2s; }
    select:focus, input:focus { outline: none; border-color: #3b82f6; background: white; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
    .input-hint { display: block; font-size: 0.75rem; color: #64748b; font-weight: 600; margin-top: 6px; }
    
    .submit-btn { width: 100%; padding: 14px; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 800; cursor: pointer; margin-top: 8px; transition: all 0.2s; box-shadow: 0 4px 12px rgba(59,130,246,0.3); }
    .primary-bg { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
    .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(59,130,246,0.4); }
    .submit-btn:disabled { background: #cbd5e1; cursor: not-allowed; box-shadow: none; }

    .spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .error-hint { display: block; font-size: 0.75rem; color: #ef4444; font-weight: 700; margin-top: 6px; }
  `]
})
export class AddUnitsFormComponent implements OnInit {
  @Input() currentUser: any = null;
  @Output() unitAdded = new EventEmitter<void>();

  month: string = 'April';
  units: number | null = null;
  currentUnits: number = 0;
  previousUnits: number | null = null;
  saving = false;

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private waterService: WaterService) { }

  ngOnInit() {
    const currentMonthIndex = new Date().getMonth();
    this.month = this.months[currentMonthIndex];
    this.loadData();
  }

  onMonthChange() {
    this.loadData();
  }

  loadData() {
    const tenantId = this.currentUser.id || this.currentUser.tenantId;
    if (!tenantId) return;

    this.waterService.getTenantUnits(tenantId, this.month).subscribe(data => {
      this.currentUnits = data.units || 0;
      this.units = this.currentUnits > 0 ? this.currentUnits : null;
    });

    // Use the static baseline from the tenant profile
    this.previousUnits = this.currentUser.previousUnits || 0;
  }

  getPreviousMonth(): string {
    const idx = this.months.indexOf(this.month);
    if (idx <= 0) return this.months[11];
    return this.months[idx - 1];
  }

  onSubmit() {
    if (this.currentUser && this.units !== null) {
      if (this.previousUnits !== null && this.units < this.previousUnits) {
        return; // Prevent saving invalid data
      }
      this.saving = true;
      this.waterService.addUnits({
        tenantId: this.currentUser.id || this.currentUser.tenantId,
        month: this.month,
        units: this.units
      }).subscribe({
        next: () => {
          this.saving = false;
          this.unitAdded.emit();
        },
        error: () => { this.saving = false; }
      });
    }
  }
}
