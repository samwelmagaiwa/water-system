import { Component, OnInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-area">
      <div class="stats-grid">
        <!-- Billing & Revenue Summary Card -->
        <div class="stat-card wide-card">
          <div class="card-split">
            <div class="split-side">
              <div class="card-top">
                <div class="icon-circle bill-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                </div>
                <span class="l-main">DAWASA BILL</span>
              </div>
              <div class="v-group">
                <span class="curr blue">TZS</span>
                <span class="main-val val-blue">{{ dashboardData?.totalBill | number:'1.0-0' }}</span>
              </div>
            </div>

            <div class="split-divider"></div>

            <div class="split-side">
              <div class="card-top">
                <div class="icon-circle cost-ico">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><path d="M16 8l-8 8"></path><path d="M12 16V8"></path></svg>
                </div>
                <span class="l-main">TENANT TOTAL</span>
              </div>
              <div class="v-group">
                <span class="curr navy">TZS</span>
                <span class="main-val val-navy">{{ dashboardData?.totalTenantCost | number:'1.0-0' }}</span>
              </div>
            </div>
          </div>
          
          <div class="card-footer-strip">
            <div class="margin-badge" [class.pos]="dashboardData?.margin >= 0" [class.neg]="dashboardData?.margin < 0">
              <span class="m-label">SYSTEM BALANCE:</span>
              <span class="m-val">{{ dashboardData?.margin >= 0 ? '+' : '' }}{{ dashboardData?.margin | number:'1.0-0' }} TZS</span>
            </div>
            <span class="l-sub">Financial Integrity Check</span>
          </div>
        </div>
        
        <!-- Collected Card -->
        <div class="stat-card">
          <div class="card-top">
            <div class="icon-circle collect-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <span class="l-main text-green">COLLECTED</span>
          </div>
          <div class="v-group">
            <span class="curr green">TZS</span>
            <span class="main-val val-green">{{ dashboardData?.collected | number:'1.0-0' }}</span>
          </div>
          <div class="sub-row">
            <span class="l-sub">This Month</span>
            <span class="l-ind">—</span>
          </div>
          <div class="water-pattern leaf-pat"></div>
        </div>
        
        <!-- Outstanding Card -->
        <div class="stat-card">
          <div class="card-top">
            <div class="icon-circle debt-ico">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            </div>
            <span class="l-main text-orange">OUTSTANDING</span>
          </div>
          <div class="v-group">
            <span class="curr orange">TZS</span>
            <span class="main-val val-orange">{{ dashboardData?.outstanding | number:'1.0-0' }}</span>
          </div>
          <div class="sub-row">
            <span class="l-sub">This Month</span>
            <span class="l-ind">—</span>
          </div>
          <div class="water-pattern city-pat"></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-area { display: flex; flex-direction: column; gap: 20px; }
    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 14px 18px;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid #f1f5f9;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
      min-height: 110px;
    }
    
    .card-top { display: flex; align-items: center; gap: 8px; position: relative; z-index: 2; margin-bottom: 2px; }

    .icon-circle {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      position: relative;
      box-shadow: 0 4px 8px -2px rgba(0,0,0,0.1);
    }
    .icon-circle svg { width: 18px; height: 18px; stroke: white; }

    .bill-ico    { background: linear-gradient(135deg, #3b82f6, #2563eb); box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4); }
    .cost-ico    { background: linear-gradient(135deg, #1e293b, #0f172a); box-shadow: 0 10px 20px -5px rgba(30, 41, 59, 0.3); }
    .collect-ico { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4); }
    .debt-ico    { background: linear-gradient(135deg, #f59e0b, #d97706); box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4); }

    .l-main { font-size: 0.65rem; font-weight: 800; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; }
    .v-group { display: flex; align-items: baseline; gap: 4px; position: relative; z-index: 2; margin-top: 0px; }
    .curr { font-size: 0.95rem; font-weight: 800; }
    .main-val { font-size: 1.75rem; font-weight: 900; letter-spacing: -1px; }

    .val-blue,   .curr.blue   { color: #2563eb; }
    .val-navy,   .curr.navy   { color: #0f172a; }
    .val-green,  .curr.green  { color: #059669; }
    .val-orange, .curr.orange { color: #d97706; }

    .sub-row { display: flex; align-items: center; gap: 6px; position: relative; z-index: 2; margin-top: auto; padding-top: 6px; }
    .l-sub { font-size: 0.75rem; font-weight: 600; color: #94a3b8; }
    
    /* Minimalist Professional Interior Patterns */
    .water-pattern {
      position: absolute;
      right: 0;
      bottom: 0;
      width: 50%;
      height: 90%;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: bottom right;
      opacity: 0.6;
      z-index: 1;
      pointer-events: none;
    }
    
    .blue-pat { 
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100" fill="none"><path d="M40 85 Q60 90 80 70 T120 80 T160 50 T200 75 V100 H40 Z" fill="%233b82f6" opacity="0.05"/><path d="M40 85 Q60 90 80 70 T120 80 T160 50 T200 75" stroke="%233b82f6" stroke-width="2" opacity="0.2"/><circle cx="80" cy="70" r="2.5" fill="%233b82f6" opacity="0.3"/><circle cx="120" cy="80" r="2.5" fill="%233b82f6" opacity="0.3"/><circle cx="160" cy="50" r="2.5" fill="%233b82f6" opacity="0.3"/></svg>'); 
    }
    
    .leaf-pat { 
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 150" fill="none"><path d="M90 140 Q90 100 120 90 M90 140 Q90 80 75 40 M90 140 Q100 110 140 110" stroke="%2310b981" stroke-width="4" opacity="0.15" stroke-linecap="round"/><path d="M120 90 C130 85 140 95 150 90 M75 40 C85 35 95 45 105 40" stroke="%2310b981" stroke-width="3" opacity="0.1" stroke-linecap="round"/></svg>');
    }
    
    .city-pat { 
      background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 100" fill="none"><rect x="110" y="50" width="10" height="50" rx="1" fill="%23f59e0b" opacity="0.1"/><rect x="125" y="35" width="12" height="65" rx="1" fill="%23f59e0b" opacity="0.15"/><rect x="140" y="60" width="10" height="40" rx="1" fill="%23f59e0b" opacity="0.1"/></svg>');
    }
    
    /* Ultra-Compact Split Card Styles */
    .wide-card { grid-column: span 1; }
    .card-split { display: flex; align-items: center; gap: 14px; position: relative; z-index: 2; margin-bottom: 2px; flex: 1; }
    .split-side { flex: 1; display: flex; flex-direction: column; gap: 0px; }
    .split-divider { width: 1px; height: 35px; background: #f1f5f9; }
    .val-navy, .curr.navy { color: #0f172a; }

    .card-footer-strip { 
      display: flex; align-items: center; justify-content: space-between; 
      padding-top: 12px; border-top: 1px solid #f1f5f9; position: relative; z-index: 2; 
    }
    .margin-badge { display: flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; }
    .margin-badge.pos { background: #f0fdf4; color: #10b981; }
    .margin-badge.neg { background: #fef2f2; color: #ef4444; }
    .m-label { opacity: 0.8; }
    

    @media (max-width: 1024px) { 
      .stats-grid { grid-template-columns: repeat(2, 1fr); } 
    }

    @media (max-width: 640px) {
      .stats-grid { grid-template-columns: 1fr; gap: 16px; }
      .main-val { font-size: 1.5rem; }
      .stat-card { padding: 16px 20px; }
      .icon-circle { width: 36px; height: 36px; }
      .icon-circle svg { width: 16px; height: 16px; }
      .p-title { font-size: 0.85rem; }
      .p-percent { font-size: 1rem; }
    }
  `]
})
export class DashboardComponent implements OnInit, OnChanges {
  @Input() month: string = 'April';
  dashboardData: any;

  constructor(private waterService: WaterService) { }

  ngOnInit() {
    this.loadDataForMonth(this.month);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['month'] && !changes['month'].firstChange) {
      this.loadDataForMonth(this.month);
    }
  }

  @Output() progressUpdate = new EventEmitter<number>();

  loadDataForMonth(month: string) {
    this.waterService.getDashboard(month).subscribe(data => {
      this.dashboardData = data;
      if (data && data.paidPercentage !== undefined) {
        this.progressUpdate.emit(data.paidPercentage);
      }
    });
  }
}
