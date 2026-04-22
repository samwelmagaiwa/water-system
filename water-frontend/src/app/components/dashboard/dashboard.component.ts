import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-card">
      <div class="card-header">
        <h2>Monthly Summary</h2>
        <div class="month-select-wrapper">
          <select [(ngModel)]="selectedMonth" (change)="onMonthChange()" class="month-select">
            @for (month of months; track month) {
              <option [value]="month">{{ month }}</option>
            }
          </select>
          <svg class="select-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card total-bill">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Total Bill</span>
            <span class="stat-value">{{ dashboardData?.totalBill | number:'1.0-0' }}</span>
            <span class="stat-currency">TZS</span>
          </div>
        </div>
        
        <div class="stat-card contributions">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Collected</span>
            <span class="stat-value">{{ dashboardData?.totalContributions | number:'1.0-0' }}</span>
            <span class="stat-currency">TZS</span>
          </div>
        </div>
        
        <div class="stat-card debt" [class.has-debt]="dashboardData?.remainingDebt > 0">
          <div class="stat-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-label">Outstanding</span>
            <span class="stat-value">{{ dashboardData?.remainingDebt | number:'1.0-0' }}</span>
            <span class="stat-currency">TZS</span>
          </div>
        </div>
      </div>
      
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-label">Collection Progress</span>
          <span class="progress-percent">{{ dashboardData?.paidPercentage | number:'1.0-0' }}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" [style.width.%]="dashboardData?.paidPercentage || 0"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-card {
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03);
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .card-header h2 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #1e293b;
    }
    .month-select-wrapper {
      position: relative;
    }
    .month-select {
      padding: 10px 40px 10px 14px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      appearance: none;
      transition: background 0.2s;
    }
    .month-select:hover {
      background: #2563eb;
    }
    .select-icon {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      pointer-events: none;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 18px;
      border-radius: 14px;
      color: white;
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255,255,255,0.2);
      flex-shrink: 0;
    }
    .stat-icon svg {
      width: 22px;
      height: 22px;
    }
    .stat-content {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .stat-label {
      font-size: 0.75rem;
      font-weight: 500;
      opacity: 0.85;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .stat-value {
      font-size: 1.35rem;
      font-weight: 700;
      line-height: 1.2;
      letter-spacing: -0.5px;
    }
    .stat-currency {
      font-size: 0.7rem;
      font-weight: 500;
      opacity: 0.8;
    }
    
    .total-bill {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    }
    .contributions {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    .debt {
      background: linear-gradient(135deg, #64748b 0%, #475569 100%);
    }
    .debt.has-debt {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .progress-card {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
    }
    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .progress-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #475569;
    }
    .progress-percent {
      font-size: 1rem;
      font-weight: 700;
      color: #10b981;
    }
    .progress-track {
      height: 10px;
      background: #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #10b981, #34d399);
      border-radius: 10px;
      transition: width 0.6s ease;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .dashboard-card {
        padding: 18px;
        border-radius: 16px;
      }
      .card-header {
        flex-direction: column;
        align-items: stretch;
      }
      .month-select-wrapper {
        align-self: flex-end;
      }
      .stats-grid {
        grid-template-columns: 1fr;
      }
      .stat-card {
        padding: 16px;
      }
      .stat-icon {
        width: 44px;
        height: 44px;
      }
      .stat-value {
        font-size: 1.2rem;
      }
    }
    
    @media (max-width: 480px) {
      .dashboard-card {
        padding: 16px;
      }
      .card-header h2 {
        font-size: 1.1rem;
      }
      .stats-grid {
        gap: 12px;
      }
      .stat-icon svg {
        width: 20px;
        height: 20px;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  @Output() monthChanged = new EventEmitter<string>();
  dashboardData: any;
  selectedMonth: string = 'March';
  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private waterService: WaterService) { }

  ngOnInit() {
    this.loadData();
  }

  onMonthChange() {
    this.loadData();
    this.monthChanged.emit(this.selectedMonth);
  }

  loadData() {
    this.waterService.getDashboard(this.selectedMonth).subscribe(data => {
      this.dashboardData = data;
    });
  }
}
