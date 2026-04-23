import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-panel">
      <div class="panel-header">
        <div class="header-left">
          <h2>Manage Tenants</h2>
          <p>Register and edit user access</p>
        </div>
        <button class="add-btn" (click)="showAddForm = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Tenant
        </button>
      </div>

      @if (showAddForm || editingTenant) {
        <div class="tenant-form-card">
          <h3>{{ editingTenant ? 'Edit Tenant Details' : 'Register New Tenant' }}</h3>
          <div class="form-grid">
            <div class="form-item">
              <label>Full Name</label>
              <input type="text" [(ngModel)]="formData.name" placeholder="Enter name">
            </div>
            <div class="form-item">
              <label>Phone Number</label>
              <input type="tel" [(ngModel)]="formData.phone" placeholder="255...">
            </div>
            <div class="form-item">
              <label>Access Level</label>
              <select [(ngModel)]="formData.role">
                <option value="TENANT">Tenant</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>
            <div class="form-item">
              <label>Door Number</label>
              <input type="text" [(ngModel)]="formData.doorNumber" placeholder="e.g. A101">
            </div>
            <div class="form-item">
              <label>Previous Units (Baseline)</label>
              <input type="number" [(ngModel)]="formData.previousUnits" placeholder="0">
            </div>
          </div>
          <div class="form-actions">
            <button class="cancel-btn" (click)="cancelForm()">Discard</button>
            <button class="save-btn" (click)="saveTenant()">
              {{ editingTenant ? 'Update Records' : 'Save Tenant' }}
            </button>
          </div>
        </div>
      }

      <div class="tenant-table-container">
        <table class="premium-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Door</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (tenant of tenants; track tenant.id; let i = $index) {
              <tr class="tenant-row">
                <td class="cell-index">{{ i + 1 }}</td>
                <td class="cell-name">{{ tenant.name }}</td>
                <td class="cell-phone">{{ tenant.phone }}</td>
                <td class="cell-door">{{ tenant.doorNumber || '-' }}</td>
                <td>
                  <span class="role-badge" [class.admin]="tenant.role === 'ADMIN'">
                    {{ tenant.role }}
                  </span>
                </td>
                <td class="actions-cell">
                  <button class="edit-btn" (click)="editTenant(tenant)" title="Edit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button class="delete-btn" 
                    [class.confirming]="confirmDeleteId === tenant.id"
                    (click)="deleteTenant(tenant.id)" 
                    [title]="confirmDeleteId === tenant.id ? 'Click again to confirm' : 'Delete'">
                    @if (confirmDeleteId === tenant.id) {
                      <span class="confirm-txt">Confirm?</span>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                    }
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .admin-panel { background: white; border-radius: 12px; padding: 16px 20px; width: 100%; }
    .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .header-left h2 { font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0; }
    .header-left p { font-size: 0.8rem; color: #64748b; margin: 2px 0 0; }
    
    .add-btn { 
      display: flex; align-items: center; gap: 8px; padding: 10px 18px; 
      background: #3b82f6; color: white; border: none; border-radius: 8px; 
      font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s;
    }
    .add-btn:hover { background: #2563eb; transform: translateY(-1px); }
    
    .tenant-form-card { 
      background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; 
      padding: 16px 20px; margin-bottom: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
    }
    .tenant-form-card h3 { margin: 0 0 16px; font-size: 1rem; font-weight: 700; color: #1e3a8a; }
    
    .form-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .form-item label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
    .form-item input, .form-item select { 
      width: 100%; padding: 12px 14px; border: 2px solid #e2e8f0; border-radius: 8px; 
      font-size: 1rem; color: #1e293b; background: white;
    }
    
    .form-actions { display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end; }
    .cancel-btn { padding: 10px 20px; background: #e2e8f0; border: none; border-radius: 8px; color: #475569; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
    .save-btn { padding: 10px 20px; background: #10b981; border: none; border-radius: 8px; color: white; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
    
    .tenant-table-container { overflow-x: auto; margin-top: 8px; }
    .premium-table { width: 100%; border-collapse: collapse; min-width: 600px; }
    .premium-table th { padding: 12px 16px; text-align: left; font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
    .premium-table td { padding: 12px 16px; font-size: 0.95rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
    
    .cell-name { font-weight: 700; color: #0f172a; }
    .cell-phone { color: #64748b; font-weight: 500; font-variant-numeric: tabular-nums; }
    .cell-door { font-weight: 700; color: #1e40af; }
    .role-badge { padding: 4px 12px; background: #f1f5f9; color: #475569; border-radius: 6px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
    .role-badge.admin { background: #dbeafe; color: #1e40af; }
    
    .actions-cell { display: flex; gap: 8px; position: relative; z-index: 5; }
    .edit-btn, .delete-btn { 
      width: 38px; height: 38px; border: none; border-radius: 10px; 
      cursor: pointer; display: flex; align-items: center; justify-content: center; 
      transition: all 0.2s; position: relative; z-index: 10; pointer-events: auto;
    }
    .edit-btn { background: #fff7ed; color: #c2410c; }
    .edit-btn:hover { background: #ffedd5; transform: scale(1.05); }
    .delete-btn { background: #fef2f2; color: #dc2626; }
    .delete-btn:hover { background: #fee2e2; transform: scale(1.05); }
    .delete-btn.confirming { width: auto; padding: 0 12px; background: #dc2626; color: white; }
    .confirm-txt { font-size: 0.75rem; font-weight: 800; }

    @media (max-width: 1024px) {
      .form-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .form-grid { grid-template-columns: 1fr; }
      .panel-header { flex-direction: column; align-items: flex-start; gap: 16px; }
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  @Input() currentUser: any = null;
  @Output() tenantsChanged = new EventEmitter<void>();
  tenants: any[] = [];
  showAddForm = false;
  editingTenant: any = null;
  confirmDeleteId: number | null = null;
  formData = { name: '', phone: '', role: 'TENANT', previousUnits: 0, doorNumber: '' };

  constructor(private waterService: WaterService) {}
  ngOnInit() { this.loadTenants(); }
  loadTenants() { this.waterService.getTenants().subscribe(data => { this.tenants = data; }); }
  editTenant(tenant: any) { 
    this.editingTenant = tenant; 
    this.formData = { 
      name: tenant.name, 
      phone: tenant.phone, 
      role: tenant.role, 
      previousUnits: tenant.previousUnits || 0,
      doorNumber: tenant.doorNumber || ''
    }; 
    this.showAddForm = true; 
  }
  cancelForm() { this.showAddForm = false; this.editingTenant = null; this.formData = { name: '', phone: '', role: 'TENANT', previousUnits: 0, doorNumber: '' }; }
  saveTenant() {
    if (!this.formData.name || !this.formData.phone) return;
    const action = this.editingTenant ? this.waterService.updateTenant(this.editingTenant.id, this.formData) : this.waterService.createTenant(this.formData);
    action.subscribe(() => { this.loadTenants(); this.cancelForm(); this.tenantsChanged.emit(); });
  }
  deleteTenant(id: number) { 
    if (this.confirmDeleteId !== id) {
      this.confirmDeleteId = id;
      setTimeout(() => { if (this.confirmDeleteId === id) this.confirmDeleteId = null; }, 3000);
      return;
    }

    this.confirmDeleteId = null;
    this.waterService.deleteTenant(id).subscribe({
      next: () => { this.loadTenants(); this.tenantsChanged.emit(); },
      error: (err) => { alert('Failed to delete tenant: ' + (err.error?.message || err.message)); }
    }); 
  }
}
