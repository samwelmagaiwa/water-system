import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-tenants-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="list-container">
      <!-- Search and Filter Header -->
      <div class="list-head">
        <div class="head-left">
          <h2 class="title">Tenant Payments</h2>
          <span class="count-pill">{{ filteredTenants.length }} Tenants</span>
        </div>
        
        <div class="head-actions">
          <div class="search-box">
            <svg class="s-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input type="text" [(ngModel)]="searchQuery" (input)="filter()" placeholder="Search tenants...">
          </div>
          
          <div class="filter-box">
            <select [(ngModel)]="statusFilter" (change)="filter()">
              <option value="all">All Status</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending</option>
            </select>
            <svg class="f-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </div>

          <div class="action-btns" *ngIf="showActions">
            <button class="btn btn-navy" (click)="onManageTenants()" *ngIf="isAdmin">
              <i class="btn-ico b-add"></i> Add Tenant
            </button>
            <button class="btn btn-orange" (click)="onSetBill()" *ngIf="isAdmin">
              <i class="btn-ico b-bill"></i> Set Monthly Bill
            </button>
            <button class="btn btn-blue" (click)="onRecordUsage()" [disabled]="!selectedTenant" *ngIf="isAdmin || (selectedTenant && (selectedTenant.id === currentUserId || selectedTenant.tenantId === currentUserId))">
              <i class="btn-ico b-usage"></i> Usage
            </button>
            <button class="btn btn-green" (click)="onRecordPayment()" [disabled]="!selectedTenant" *ngIf="isAdmin || (selectedTenant && (selectedTenant.id === currentUserId || selectedTenant.tenantId === currentUserId))">
              <i class="btn-ico b-pay"></i> Pay
            </button>
          </div>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="pro-table">
          <thead>
            <tr>
              <th>TENANT NAME</th>
              <th>PHONE NUMBER</th>
              <th>DOOR NUMBER</th>
              <th>PREVIOUS UNITS</th>
              <th>CURRENT UNITS</th>
              <th>BILL UNIT</th>
              <th>TOTAL COST</th>
              <th>AMOUNT PAID</th>
              <th>BALANCE DUE</th>
              <th>STATUS</th>
              <th *ngIf="isAdmin || isUserInList()" style="text-align: right; padding-right: 32px;">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of filteredTenants" 
                (click)="selectedTenant = t" 
                [class.active-row]="selectedTenant === t">
              <td class="t-name">{{ t.name }}</td>
              <td class="t-phone">{{ t.phone }}</td>
              <td class="t-door">{{ t.doorNumber || 'N/A' }}</td>
              <td>
                <span class="baseline-val">{{ t.previousUnits || 0 }}</span>
              </td>
              <td>{{ t.units || 0 }}</td>
              <td class="font-bold text-blue">{{ t.billUnit || 0 }}</td>
              <td class="font-bold">{{ t.cost | number:'1.0-0' }}</td>
              <td class="text-green font-bold">{{ t.paid | number:'1.0-0' }}</td>
              <td class="text-orange font-bold">{{ t.due | number:'1.0-0' }}</td>
              <td>
                <span class="status-badge" [class]="t.status">
                  {{ t.status }}
                </span>
              </td>
              <td *ngIf="isAdmin || t.id === currentUserId || t.tenantId === currentUserId">
                <div class="row-actions">
                  <button class="r-btn b-edit" *ngIf="isAdmin" (click)="onUpdateBaseline(t)" title="Update Baseline">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                  </button>
                  <button class="r-btn b-usage" (click)="onRowUsage(t)" title="Record Usage">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>
                  </button>
                  <button class="r-btn b-pay" (click)="onRowPayment(t)" title="Record Payment">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Loading State -->
        <div class="loading-state" *ngIf="isLoading()">
          <div class="skeleton-row" *ngFor="let i of [1,2,3,4,5]">
            <div class="skel skel-name"></div>
            <div class="skel skel-unit"></div>
            <div class="skel skel-unit"></div>
            <div class="skel skel-unit"></div>
            <div class="skel skel-cost"></div>
            <div class="skel skel-status"></div>
          </div>
          <div class="loading-overlay">
            <div class="spinner"></div>
            <p>Syncing tenant records...</p>
          </div>
        </div>

        <!-- Modern Empty State -->
        <div class="empty-state" *ngIf="!isLoading() && filteredTenants.length === 0">
          <div class="empty-gfx">
            <div class="gfx-search">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="40" fill="#eff6ff"/>
                <path d="M120 120L150 150" stroke="#3b82f6" stroke-width="8" stroke-linecap="round"/>
                <rect x="70" y="70" width="60" height="60" rx="12" stroke="#3b82f6" stroke-width="4"/>
                <path d="M85 85H115M85 100H115M85 115H100" stroke="#3b82f6" stroke-width="4" stroke-linecap="round"/>
                <circle cx="150" cy="150" r="15" fill="#3b82f6" opacity="0.1"/>
              </svg>
            </div>
            <div class="gfx-waves"></div>
          </div>
          <h3 class="e-title">No tenant data found for this month</h3>
          <p class="e-subtext">Add tenants or generate bills to get started</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .list-container { background: white; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); border: 1px solid #f1f5f9; display: flex; flex-direction: column; overflow: hidden; }
    
    .list-head { padding: 24px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f8fafc; gap: 20px; flex-wrap: wrap; }
    .head-left { display: flex; align-items: center; gap: 16px; }
    .title { font-size: 1.15rem; font-weight: 800; color: #1e293b; margin: 0; }
    .count-pill { background: #eff6ff; color: #3b82f6; font-size: 0.75rem; font-weight: 800; padding: 4px 12px; border-radius: 20px; }

    .head-actions { display: flex; gap: 12px; align-items: center; flex: 1; justify-content: flex-end; }
    .search-box { position: relative; flex: 1; max-width: 320px; }
    .s-ico { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; color: #94a3b8; }
    .search-box input { width: 100%; padding: 10px 16px 10px 42px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.9rem; outline: none; transition: all 0.2s; }
    .search-box input:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 4px rgba(59,130,246,0.05); }

    .filter-box { position: relative; }
    .filter-box select { padding: 10px 36px 10px 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; font-size: 0.9rem; font-weight: 600; color: #64748b; appearance: none; outline: none; cursor: pointer; }
    .f-ico { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); width: 14px; color: #94a3b8; pointer-events: none; }

    .action-btns { display: flex; gap: 8px; margin-left: 12px; }
    .btn { display: flex; align-items: center; gap: 8px; padding: 10px 18px; border: none; border-radius: 10px; color: white; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(0,0,0,0.1); }
    .btn-orange { background: #f59e0b; }
    .btn-blue { background: #3b82f6; }
    .btn-green { background: #10b981; }
    .btn-navy { background: #1e293b; }
    
    .btn-ico { width: 18px; height: 18px; background-size: contain; background-repeat: no-repeat; filter: brightness(0) invert(1); }
    .b-add { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>'); }
    .b-bill { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>'); }
    .b-usage { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 20.25a8.25 8.25 0 1 0-16.5 0"></path><path d="M3.75 3.75v16.5h16.5"></path></svg>'); }
    .b-pay { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>'); }

    .table-wrapper { width: 100%; overflow-x: auto; }
    .pro-table { width: 100%; border-collapse: collapse; min-width: 1000px; }
    .pro-table th { background: #f8fafc; padding: 16px 24px; text-align: left; font-size: 0.75rem; font-weight: 800; color: #94a3b8; letter-spacing: 0.5px; border-bottom: 1px solid #f1f5f9; }
    .pro-table tr { border-bottom: 1px solid #f8fafc; transition: all 0.2s; cursor: pointer; }
    .pro-table tr:hover { background: #f8fafc; }
    .pro-table tr.active-row { background: #eff6ff; border-left: 4px solid #3b82f6; }
    .pro-table td { padding: 18px 24px; font-size: 0.9rem; color: #475569; }
    .t-name { font-weight: 800; color: #1e293b; }
    .t-phone { color: #64748b; font-size: 0.85rem; font-weight: 600; font-variant-numeric: tabular-nums; }
    .t-door { font-weight: 700; color: #334155; }
    .font-bold { font-weight: 800; }
    .text-green { color: #10b981; }
    .text-orange { color: #f97316; }

    .status-badge { padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; }
    .status-badge.PAID { background: #ecfdf5; color: #059669; }
    .status-badge.PENDING { background: #fff7ed; color: #9a3412; }

    /* Empty State */
    .empty-state { padding: 80px 40px; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .empty-gfx { margin-bottom: 24px; position: relative; }
    .gfx-search { width: 120px; height: 120px; }
    .e-title { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0 0 6px; }
    .e-subtext { font-size: 0.85rem; color: #94a3b8; font-weight: 600; margin: 0; }

    /* Row Actions */
    .row-actions { display: flex; justify-content: flex-end; gap: 8px; padding-right: 8px; }
    .r-btn { width: 34px; height: 34px; border: none; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .r-btn svg { width: 16px; height: 16px; }
    
    .r-btn.b-edit { background: #fff7ed; color: #f59e0b; }
    .r-btn.b-edit:hover { background: #f59e0b; color: white; transform: translateY(-1px); }
    
    .r-btn.b-usage { background: #eff6ff; color: #3b82f6; }
    .r-btn.b-usage:hover { background: #3b82f6; color: white; transform: translateY(-1px); }
    
    .r-btn.b-pay { background: #f0fdf4; color: #10b981; }
    .r-btn.b-pay:hover { background: #10b981; color: white; transform: translateY(-1px); }

    /* Loading State Styles */
    .loading-state { position: relative; padding: 20px; min-height: 300px; }
    .skeleton-row { display: flex; gap: 20px; padding: 18px 24px; border-bottom: 1px solid #f8fafc; }
    .skel { background: #f1f5f9; border-radius: 4px; height: 16px; position: relative; overflow: hidden; }
    .skel::after {
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
      animation: shimmer 1.5s infinite;
    }
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .skel-name { width: 140px; }
    .skel-unit { width: 80px; }
    .skel-cost { width: 100px; }
    .skel-status { width: 90px; margin-left: auto; }

    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,0.7);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 16px;
      backdrop-filter: blur(2px);
    }
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #eff6ff;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-overlay p { color: #3b82f6; font-weight: 800; font-size: 0.95rem; margin: 0; }

    /* Media Queries for Responsiveness */
    @media (max-width: 1024px) {
      .list-head { padding: 16px; }
      .head-actions { width: 100%; justify-content: flex-start; flex-wrap: wrap; }
      .search-box { max-width: 100%; width: 100%; order: 1; }
      .filter-box { order: 2; }
      .action-btns { order: 3; margin-left: 0; width: 100%; justify-content: space-between; }
      .btn { flex: 1; justify-content: center; padding: 10px; font-size: 0.8rem; }
    }

    @media (max-width: 640px) {
      .title { font-size: 1rem; }
      .count-pill { font-size: 0.7rem; }
      .pro-table th, .pro-table td { padding: 12px 16px; }
      .action-btns { gap: 4px; }
      .btn { padding: 8px 4px; }
    }
  `]
})
export class TenantsListComponent implements OnInit, OnChanges {
  @Input() month: string = 'April';
  @Input() showActions: boolean = false;
  @Input() isAdmin: boolean = false;
  @Input() currentUserId: number | null = null;
  @Output() setBill = new EventEmitter<void>();
  @Output() recordUsage = new EventEmitter<void>();
  @Output() recordPayment = new EventEmitter<void>();
  @Output() manageTenants = new EventEmitter<void>();
  @Output() updateBaseline = new EventEmitter<any>();

  tenantsUsage: any[] = [];
  filteredTenants: any[] = [];
  searchQuery: string = '';
  statusFilter: string = 'all';
  selectedTenant: any = null;
  isLoading = signal(false);

  constructor(private waterService: WaterService) { }

  ngOnInit() {
    this.loadDataForMonth(this.month);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['month'] && !changes['month'].firstChange) {
      this.loadDataForMonth(this.month);
    }
  }

  loadDataForMonth(month: string) {
    this.isLoading.set(true);
    this.waterService.getTenantSummary(month).subscribe({
      next: (data) => {
        this.tenantsUsage = data;
        this.filter();
        
        // Auto-select current tenant if not admin
        if (!this.isAdmin && this.currentUserId) {
          const self = this.tenantsUsage.find(t => t.id === this.currentUserId || t.tenantId === this.currentUserId);
          if (self) this.selectedTenant = self;
        }
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching data:', err);
        this.isLoading.set(false);
      }
    });
  }

  filter() {
    if (!this.tenantsUsage) {
      this.filteredTenants = [];
      return;
    }
    this.filteredTenants = this.tenantsUsage.filter(t => {
      const name = t.name || '';
      const matchSearch = name.toLowerCase().includes((this.searchQuery || '').toLowerCase());
      const matchStatus = this.statusFilter === 'all' || t.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  onSetBill() { this.setBill.emit(); }
  onManageTenants() { this.manageTenants.emit(); }
  onUpdateBaseline(tenant: any) { this.updateBaseline.emit(tenant); }

  isUserInList(): boolean {
    return this.filteredTenants.some(t => t.id === this.currentUserId || t.tenantId === this.currentUserId);
  }

  onRowUsage(tenant: any) {
    this.selectedTenant = tenant;
    this.recordUsage.emit(tenant);
  }

  onRowPayment(tenant: any) {
    this.selectedTenant = tenant;
    this.recordPayment.emit(tenant);
  }
  
  onRecordUsage() {
    if (this.selectedTenant) this.recordUsage.emit(this.selectedTenant);
  }

  onRecordPayment() {
    if (this.selectedTenant) this.recordPayment.emit(this.selectedTenant);
  }
}
