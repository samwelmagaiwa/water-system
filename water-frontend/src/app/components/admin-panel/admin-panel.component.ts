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
        <h2>Manage Tenants</h2>
        <button class="add-btn" (click)="showAddForm = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Tenant
        </button>
      </div>

      @if (showAddForm || editingTenant) {
        <div class="tenant-form">
          <h3>{{ editingTenant ? 'Edit Tenant' : 'Add New Tenant' }}</h3>
          <div class="form-row">
            <div class="form-group">
              <label>Name</label>
              <input type="text" [(ngModel)]="formData.name" placeholder="Enter name">
            </div>
            <div class="form-group">
              <label>Phone</label>
              <input type="tel" [(ngModel)]="formData.phone" placeholder="255700000000">
            </div>
            <div class="form-group">
              <label>Role</label>
              <select [(ngModel)]="formData.role">
                <option value="TENANT">Tenant</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button class="cancel-btn" (click)="cancelForm()">Cancel</button>
            <button class="save-btn" (click)="saveTenant()">
              {{ editingTenant ? 'Update' : 'Add' }}
            </button>
          </div>
        </div>
      }

      <div class="tenant-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (tenant of tenants; track tenant.id; let i = $index) {
              <tr>
                <td>{{ i + 1 }}</td>
                <td>{{ tenant.name }}</td>
                <td>{{ tenant.phone }}</td>
                <td>
                  <span class="role-badge" [class.admin]="tenant.role === 'ADMIN'">
                    {{ tenant.role }}
                  </span>
                </td>
                <td class="actions">
                  <button class="edit-btn" (click)="editTenant(tenant)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5z"></path>
                    </svg>
                  </button>
                  <button class="delete-btn" (click)="deleteTenant(tenant.id)">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
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
    .admin-panel {
      background: white;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .panel-header h2 {
      font-size: 1.2rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .add-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
    }
    .add-btn:hover { background: #2563eb; }
    
    .tenant-form {
      background: #f8fafc;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .tenant-form h3 {
      margin: 0 0 16px;
      font-size: 1rem;
      color: #1e293b;
    }
    .form-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
    }
    .form-group label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: #475569;
      margin-bottom: 4px;
    }
    .form-group input, .form-group select {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 16px;
      justify-content: flex-end;
    }
    .cancel-btn {
      padding: 10px 20px;
      background: #e2e8f0;
      border: none;
      border-radius: 8px;
      color: #64748b;
      font-weight: 600;
      cursor: pointer;
    }
    .save-btn {
      padding: 10px 20px;
      background: #10b981;
      border: none;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      cursor: pointer;
    }
    .save-btn:hover { background: #059669; }
    
    .tenant-table {
      overflow-x: auto;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e2e8f0;
    }
    th {
      font-size: 0.75rem;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    td {
      font-size: 0.9rem;
      color: #334155;
    }
    .role-badge {
      padding: 4px 10px;
      background: #e2e8f0;
      color: #64748b;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .role-badge.admin {
      background: #dbeafe;
      color: #1d4ed8;
    }
    .actions {
      display: flex;
      gap: 8px;
    }
    .edit-btn, .delete-btn {
      width: 32px;
      height: 32px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .edit-btn {
      background: #fef3c7;
      color: #d97706;
    }
    .edit-btn:hover { background: #fde68a; }
    .delete-btn {
      background: #fee2e2;
      color: #dc2626;
    }
    .delete-btn:hover { background: #fecaca; }
    
    @media (max-width: 768px) {
      .form-row { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminPanelComponent implements OnInit {
  @Input() currentUser: any = null;
  @Output() tenantsChanged = new EventEmitter<void>();

  tenants: any[] = [];
  showAddForm = false;
  editingTenant: any = null;
  formData = { name: '', phone: '', role: 'TENANT' };

  constructor(private waterService: WaterService) {}

  ngOnInit() {
    this.loadTenants();
  }

  loadTenants() {
    this.waterService.getTenants().subscribe(data => {
      this.tenants = data;
    });
  }

  editTenant(tenant: any) {
    this.editingTenant = tenant;
    this.formData = { name: tenant.name, phone: tenant.phone, role: tenant.role };
    this.showAddForm = true;
  }

  cancelForm() {
    this.showAddForm = false;
    this.editingTenant = null;
    this.formData = { name: '', phone: '', role: 'TENANT' };
  }

  saveTenant() {
    if (!this.formData.name || !this.formData.phone) return;

    if (this.editingTenant) {
      this.waterService.updateTenant(this.editingTenant.id, this.formData).subscribe(() => {
        this.loadTenants();
        this.cancelForm();
        this.tenantsChanged.emit();
      });
    } else {
      this.waterService.createTenant(this.formData).subscribe(() => {
        this.loadTenants();
        this.cancelForm();
        this.tenantsChanged.emit();
      });
    }
  }

  deleteTenant(id: number) {
    if (confirm('Are you sure you want to delete this tenant?')) {
      this.waterService.deleteTenant(id).subscribe(() => {
        this.loadTenants();
        this.tenantsChanged.emit();
      });
    }
  }
}
