import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-tenants-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="list-card">
      <div class="card-header">
        <h2>Tenant Payments</h2>
        <span class="tenant-count">{{ tenantsUsage.length }} tenants</span>
      </div>
      
      <div class="table-scroll">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Units</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Due</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            @for (tenant of tenantsUsage; track tenant.tenantId) {
              <tr [class.paid-status]="tenant.status === 'PAID'" [class.pending-status]="tenant.status === 'PENDING'">
                <td class="name-cell">{{ tenant.name }}</td>
                <td class="units-cell">{{ tenant.units }}</td>
                <td class="amount-cell">{{ tenant.cost | number:'1.0-0' }}</td>
                <td class="amount-cell paid-cell">{{ tenant.paid | number:'1.0-0' }}</td>
                <td class="amount-cell" [class.due-cell]="tenant.due > 0">{{ tenant.due | number:'1.0-0' }}</td>
                <td>
                  <span class="status-pill" [class.paid]="tenant.status === 'PAID'" [class.pending]="tenant.status === 'PENDING'">
                    <span class="status-dot"></span>
                    {{ tenant.status }}
                  </span>
                </td>
              </tr>
            }
            @empty {
              <tr class="empty-row">
                <td colspan="6">No tenant data available</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .list-card {
      background: white;
      border-radius: 20px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.03);
      overflow: hidden;
    }
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px 16px;
    }
    .card-header h2 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1e293b;
    }
    .tenant-count {
      font-size: 0.85rem;
      font-weight: 500;
      color: #64748b;
      background: #f1f5f9;
      padding: 4px 12px;
      border-radius: 20px;
    }
    
    .table-scroll {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 600px;
    }
    .data-table thead {
      background: #f8fafc;
    }
    .data-table th {
      padding: 12px 16px;
      text-align: left;
      font-size: 0.7rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .data-table td {
      padding: 14px 16px;
      font-size: 0.9rem;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }
    .data-table tbody tr {
      transition: background 0.15s;
    }
    .data-table tbody tr:hover {
      background: #f8fafc;
    }
    .paid-status {
      background: #f0fdf4;
    }
    .paid-status:hover {
      background: #dcfce7 !important;
    }
    .pending-status {
      background: #fffbeb;
    }
    .pending-status:hover {
      background: #fef3c7 !important;
    }
    
    .name-cell {
      font-weight: 600;
      color: #1e293b;
    }
    .units-cell {
      font-weight: 600;
      color: #4338ca;
    }
    .amount-cell {
      font-weight: 500;
      font-variant-numeric: tabular-nums;
    }
    .paid-cell {
      color: #059669;
    }
    .due-cell {
      color: #dc2626;
      font-weight: 600;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .status-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
    }
    .status-pill.paid {
      background: #dcfce7;
      color: #166534;
    }
    .status-pill.paid .status-dot {
      background: #22c55e;
    }
    .status-pill.pending {
      background: #fef9c3;
      color: #854d0e;
    }
    .status-pill.pending .status-dot {
      background: #eab308;
    }
    
    .empty-row td {
      text-align: center;
      padding: 48px 16px;
      color: #94a3b8;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .list-card {
        border-radius: 16px;
      }
      .card-header {
        padding: 16px 18px 12px;
      }
      .card-header h2 {
        font-size: 1.1rem;
      }
      .data-table th,
      .data-table td {
        padding: 12px 14px;
      }
    }
    
    @media (max-width: 480px) {
      .card-header {
        padding: 14px 16px 10px;
      }
      .data-table th,
      .data-table td {
        padding: 10px 12px;
        font-size: 0.85rem;
      }
      .status-pill {
        padding: 3px 8px;
        font-size: 0.7rem;
      }
    }
  `]
})
export class TenantsListComponent implements OnInit, OnChanges {
  @Input() month: string = 'March';
  tenantsUsage: any[] = [];

  constructor(private waterService: WaterService) { }

  ngOnInit() {
    this.loadDataForMonth(this.month);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['month'] && !changes['month'].firstChange) {
      this.loadDataForMonth(changes['month'].currentValue);
    }
  }

  loadDataForMonth(month: string) {
    this.waterService.getTenantSummary(month).subscribe(data => {
      this.tenantsUsage = data;
    });
  }

  loadData() {
    this.loadDataForMonth(this.month);
  }
}
