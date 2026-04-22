import { Component, EventEmitter, OnInit, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-add-units-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-card">
      <div class="form-header">
        <div class="header-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
        </div>
        <div>
          <h3>Record Usage</h3>
          <p>Add water units consumed</p>
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
          <label>Month</label>
          <select [(ngModel)]="month" name="month" required>
            @for (m of months; track m) {
              <option [value]="m">{{ m }}</option>
            }
          </select>
        </div>
        
        <div class="field-group">
          <label>Units</label>
          <input type="number" [(ngModel)]="units" name="units" required min="0" placeholder="Enter units">
        </div>
        
        <button type="submit" [disabled]="!currentUser || !units" class="submit-button">
          <span>Save Usage</span>
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
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      margin-bottom: 16px;
      color: #1e40af;
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
    select, input {
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
    select:focus, input:focus {
      outline: none;
      border-color: #3b82f6;
      background: white;
      box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
    }
    select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 40px;
    }
    
    .submit-button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
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
      box-shadow: 0 4px 12px rgba(37,99,235,0.35);
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
export class AddUnitsFormComponent implements OnInit {
  @Input() currentUser: any = null;
  
  month: string = 'March';
  units: number | null = null;
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  @Output() unitAdded = new EventEmitter<void>();

  constructor(private waterService: WaterService) { }

  ngOnInit() {}

  onSubmit() {
    if (this.currentUser && this.units !== null) {
      this.waterService.addUnits({
        tenantId: this.currentUser.id,
        month: this.month,
        units: this.units
      }).subscribe(() => {
        this.units = null;
        this.unitAdded.emit();
      });
    }
  }
}
