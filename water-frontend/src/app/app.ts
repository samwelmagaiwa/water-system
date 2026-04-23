import { Component, ViewChild, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TenantsListComponent } from './components/tenants-list/tenants-list.component';
import { AddUnitsFormComponent } from './components/add-units-form/add-units-form.component';
import { PaymentFormComponent } from './components/payment-form/payment-form.component';
import { LoginComponent } from './components/login/login.component';
import { AdminPanelComponent } from './components/admin-panel/admin-panel.component';
import { SetBillFormComponent } from './components/set-bill-form/set-bill-form.component';
import { WaterService } from './services/water.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, DashboardComponent, TenantsListComponent, AddUnitsFormComponent, PaymentFormComponent, LoginComponent, AdminPanelComponent, SetBillFormComponent],
  template: `
    @if (!isLoggedIn()) {
      <app-login (loggedIn)="onLogin($event)"></app-login>
    } @else {
      <div class="app-layout" [class.sidebar-open]="isSidebarOpen()">
        <!-- Sidebar Backdrop -->
        <div class="sidebar-backdrop" (click)="closeSidebar()"></div>

        <!-- Sidebar Navigation -->
        <aside class="sidebar">
          <div class="sidebar-brand">
            <div class="brand-logo">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"/></svg>
            </div>
            <div class="brand-text">
              <span class="brand-name">nexoryatech</span>
              <span class="brand-tag">WATER MANAGEMENT</span>
            </div>
          </div>

          <nav class="sidebar-nav">
            <div class="nav-item" [class.active]="activeView() === 'dashboard'" (click)="setView('dashboard')">
              <i class="nav-icon dash"></i>
              <span>Dashboard</span>
            </div>
            <div class="nav-item" [class.active]="activeView() === 'tenants'" (click)="setView('tenants')">
              <i class="nav-icon tenants"></i>
              <span>Tenants</span>
            </div>
            <div class="nav-item" (click)="openModal('recordPayment')">
              <i class="nav-icon payments"></i>
              <span>Payments</span>
            </div>
            <div class="nav-item" (click)="openModal('recordUsage')">
              <i class="nav-icon usage"></i>
              <span>Usage</span>
            </div>
            <div class="nav-item" [class.active]="activeView() === 'reports'" (click)="setView('reports')">
              <i class="nav-icon reports"></i>
              <span>Reports</span>
            </div>
            <div class="nav-item" [class.active]="activeView() === 'settings'" (click)="setView('settings')">
              <i class="nav-icon settings"></i>
              <span>Settings</span>
            </div>
          </nav>

          <div class="sidebar-footer">
            <div class="help-card">
              <div class="help-icon">🎧</div>
              <div class="help-text">
                <span class="h-title">Need Help?</span>
                <span class="h-sub">Visit our help center</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Content Area -->
        <div class="main-wrapper">
          <header class="top-header">
            <div class="header-inner">
              <div class="header-left">
                <button class="menu-toggle" (click)="toggleSidebar()" aria-label="Toggle Menu">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                
                <div class="header-search">
                  <div class="search-input-wrapper">
                    <svg class="search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <input type="text" placeholder="Search anything...">
                    <span class="search-hint">⌘K</span>
                  </div>
                </div>

                <div class="header-progress">
                  <div class="h-p-top">
                    <span class="h-p-title">Collection Progress</span>
                    <span class="h-p-percent">{{ collectionProgress() | number:'1.0-0' }}%</span>
                  </div>
                  <div class="h-p-bar">
                    <div class="h-p-fill" [style.width.%]="collectionProgress()"></div>
                  </div>
                  <span class="h-p-caption">Let's make every drop count! 💧</span>
                </div>
              </div>

              <div class="header-actions">
                <div class="month-selector-group">
                  <div class="selector-box">
                    <svg class="cal-ico" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <select [(ngModel)]="selectedMonth" (change)="onMonthHeaderChange()" class="header-month-select">
                      @for (m of months; track m) {
                        <option [value]="m">{{ m }} 2024</option>
                      }
                    </select>
                    <svg class="arrow-ico" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>
                </div>

                <div class="user-profile-container">
                  <div class="user-profile" (click)="toggleUserDropdown()">
                    <div class="u-avatar">{{ currentUser()?.name?.charAt(0) }}</div>
                    <div class="u-info">
                      <span class="u-name">{{ currentUser()?.name }}</span>
                      <span class="u-role">{{ isAdmin() ? 'Administrator' : 'Tenant' }}</span>
                    </div>
                    <svg class="u-arrow" [class.open]="isUserDropdownOpen()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </div>

                  @if (isUserDropdownOpen()) {
                    <div class="user-dropdown">
                      <div class="dropdown-header">
                        <span class="d-label">User Account</span>
                      </div>
                      <div class="dropdown-item" (click)="setView('settings')">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                        <span>Account Settings</span>
                      </div>
                      <div class="dropdown-divider"></div>
                      <div class="dropdown-item logout" (click)="confirmLogout()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        <span>Logout</span>
                      </div>
                    </div>
                  }
                </div>

                <div class="header-notifications" (click)="clearNotifications()">
                  <button class="notif-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    @if (notificationCount() > 0) {
                      <span class="notif-badge">{{ notificationCount() }}</span>
                    }
                  </button>
                </div>
              </div>
            </div>
          </header>

          @if (showLogoutConfirm()) {
            <div class="modal-overlay" (click)="cancelLogout()">
              <div class="confirm-card" (click)="$event.stopPropagation()">
                <div class="confirm-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </div>
                <h3>Confirm Logout</h3>
                <p>Are you sure you want to sign out of AquaFlow?</p>
                <div class="confirm-btns">
                  <button class="btn-no" (click)="cancelLogout()">No, Stay</button>
                  <button class="btn-yes" (click)="logout()">Yes, Logout</button>
                </div>
              </div>
            </div>
          }

          <main class="content-body">
            @if (activeView() === 'dashboard') {
              <app-dashboard 
                #dashboard 
                [month]="selectedMonth"
                (progressUpdate)="updateProgress($event)">
              </app-dashboard>
              <app-tenants-list 
                #tenantsList 
                [month]="selectedMonth" 
                [showActions]="true"
                [isAdmin]="isAdmin()"
                [currentUserId]="currentUser()?.id"
                (setBill)="openModal('setBill')"
                (recordUsage)="openModal('recordUsage', $event)"
                (recordPayment)="openModal('recordPayment', $event)"
                (manageTenants)="openModal('manage')"
                (updateBaseline)="openModal('editBaseline', $event)">
              </app-tenants-list>
            }
            @if (activeView() === 'tenants') {
              <app-tenants-list 
                #tenantsList 
                [month]="selectedMonth" 
                [showActions]="true"
                [isAdmin]="isAdmin()"
                [currentUserId]="currentUser()?.id"
                (setBill)="openModal('setBill')"
                (recordUsage)="openModal('recordUsage', $event)"
                (recordPayment)="openModal('recordPayment', $event)"
                (manageTenants)="openModal('manage')"
                (updateBaseline)="openModal('editBaseline', $event)">
              </app-tenants-list>
            }
            @if (['billing', 'payments', 'usage', 'reports', 'settings'].includes(activeView())) {
              <div class="placeholder-view">
                <h2>{{ activeView() | titlecase }}</h2>
                <p>This section is currently under development.</p>
              </div>
            }
          </main>
        </div>

        @if (activeModal) {
          <div class="modal-overlay" (click)="closeModal()">
            <div class="modal-window" [class.wide]="activeModal === 'manage'" (click)="$event.stopPropagation()">
              <button class="modal-close" (click)="closeModal()">&times;</button>
              
              @if (activeModal === 'setBill') {
                <app-set-bill-form (billSet)="refreshAll()"></app-set-bill-form>
              }
              @if (activeModal === 'recordUsage') {
                <app-add-units-form [currentUser]="selectedTenant" (unitAdded)="refreshAll()"></app-add-units-form>
              }
              @if (activeModal === 'recordPayment') {
                <app-payment-form [currentUser]="selectedTenant" (paymentAdded)="refreshAll()"></app-payment-form>
              }
              @if (activeModal === 'manage') {
                <app-admin-panel [currentUser]="currentUser()" (tenantsChanged)="refreshAll()"></app-admin-panel>
              }
              @if (activeModal === 'editBaseline') {
                <div class="form-core">
                  <div class="form-head">
                    <div class="ico-box baseline-bg">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </div>
                    <div class="head-info">
                      <h3>Update Baseline</h3>
                      <p>Setting initial meter reading for {{ selectedTenant?.name }}</p>
                    </div>
                  </div>
                  <div class="form-body">
                    <div class="field-item">
                      <label>New Baseline Units</label>
                      <input type="number" #newBase [value]="selectedTenant?.previousUnits || 0" placeholder="Enter units">
                    </div>
                    <button class="submit-btn baseline-bg" (click)="saveBaseline(+newBase.value)">Update Records</button>
                  </div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: block; background: #f8fafc; min-height: 100vh; font-family: 'Inter', system-ui, sans-serif; }
    .app-layout { display: flex; min-height: 100vh; }

    /* Sidebar Styling - Dark Blue Gradient with Glassmorphism */
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #2a4e9c 0%, #1c3672 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: sticky;
      top: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 1000;
    }
    .sidebar-brand { padding: 32px 24px; display: flex; align-items: center; gap: 12px; }
    .brand-logo { width: 36px; height: 36px; background: white; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: #2a4e9c; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .brand-logo svg { width: 22px; height: 22px; }
    .brand-text { display: flex; flex-direction: column; }
    .brand-name { font-size: 1.25rem; font-weight: 800; letter-spacing: -0.5px; }
    .brand-tag { font-size: 0.65rem; font-weight: 700; opacity: 0.7; letter-spacing: 1px; }

    .sidebar-nav { flex: 1; padding: 0 12px; }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 14px 20px;
      border-radius: 12px;
      cursor: pointer;
      margin-bottom: 2px;
      transition: all 0.2s;
      font-weight: 600;
      font-size: 0.95rem;
      opacity: 0.8;
    }
    .nav-item:hover { background: rgba(255,255,255,0.1); opacity: 1; }
    .nav-item.active { background: white; color: #2a4e9c; opacity: 1; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    
    .nav-icon { width: 20px; height: 20px; display: inline-block; background-size: contain; background-repeat: no-repeat; opacity: 0.8; }
    .active .nav-icon { filter: invert(21%) sepia(87%) saturate(2256%) hue-rotate(218deg) brightness(91%) contrast(101%); }
    
    /* Simplified Nav Icons via generated SVG backgrounds - would normally use icons */
    .nav-icon.dash { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>'); }
    .nav-icon.tenants { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>'); }
    .nav-icon.billing { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>'); }
    .nav-icon.payments { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>'); }
    .nav-icon.usage { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.25a8.25 8.25 0 1 0-16.5 0"></path><path d="M3.75 3.75v16.5h16.5"></path></svg>'); }
    .nav-icon.reports { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>'); }
    .nav-icon.settings { background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>'); }

    .sidebar-footer { padding: 24px 16px; margin-top: 40px; }
    .help-card { background: white; border-radius: 12px; padding: 16px; display: flex; align-items: center; gap: 12px; color: #2a4e9c; }
    .help-icon { width: 32px; height: 32px; background: #eff6ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 1rem; }
    .help-text { display: flex; flex-direction: column; }
    .h-title { font-size: 0.85rem; font-weight: 800; }
    .h-sub { font-size: 0.65rem; opacity: 0.7; }

    .sidebar-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(4px);
      z-index: 999;
    }

    /* Main Area Layout */
    .main-wrapper { flex: 1; display: flex; flex-direction: column; padding: 0; min-width: 0; }
    
    .top-header { 
      position: sticky;
      top: 0;
      z-index: 100;
    }
    
    .content-body { display: flex; flex-direction: column; gap: 24px; padding: 24px 32px; }

    .header-inner {
      background: white;
      border-radius: 0;
      padding: 16px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 0 rgba(0,0,0,0.05);
      border-bottom: 1px solid #f1f5f9;
      gap: 32px;
    }

    .header-left { display: flex; align-items: center; gap: 24px; flex: 1; }
    .menu-toggle {
      display: flex;
      background: transparent;
      border: none;
      width: 32px;
      height: 32px;
      align-items: center;
      justify-content: center;
      color: #64748b;
      cursor: pointer;
      transition: all 0.2s;
    }
    .menu-toggle:hover { color: #1e293b; }
    .menu-toggle svg { width: 24px; height: 24px; }

    .header-search { display: block; flex: 1; max-width: 400px; }
    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: #f8fafc;
      border-radius: 100px;
      border: 1px solid #e2e8f0;
      padding: 0 16px;
      transition: all 0.2s;
    }
    .search-input-wrapper:focus-within { background: white; border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.05); }
    .search-ico { width: 18px; color: #94a3b8; margin-right: 12px; }
    .search-input-wrapper input {
      border: none;
      background: transparent;
      padding: 10px 0;
      font-size: 0.9rem;
      width: 100%;
      outline: none;
      color: #1e293b;
    }
    .search-hint { font-size: 0.7rem; font-weight: 700; color: #94a3b8; background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0; }

    .header-progress { display: flex; flex-direction: column; width: 350px; gap: 4px; padding-left: 24px; border-left: 1px solid #f1f5f9; }
    .h-p-top { display: flex; justify-content: space-between; align-items: center; }
    .h-p-title { font-size: 0.75rem; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 0.5px; }
    .h-p-percent { font-size: 0.85rem; font-weight: 900; color: #3b82f6; }
    .h-p-bar { height: 8px; background: #f1f5f9; border-radius: 10px; overflow: hidden; border: 1px solid #f1f5f9; }
    .h-p-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #60a5fa); border-radius: 10px; transition: width 1s cubic-bezier(0.4, 0, 0.2, 1); }
    .h-p-caption { font-size: 0.65rem; color: #94a3b8; font-weight: 600; font-style: italic; }

    .header-actions { display: flex; align-items: center; gap: 32px; }
    
    .month-selector-group { background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 2px 4px; transition: all 0.2s; }
    .month-selector-group:hover { background: white; border-color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.05); }
    .selector-box { display: flex; align-items: center; gap: 10px; padding: 8px 12px; color: #1e293b; cursor: pointer; position: relative; min-width: 140px; }
    .header-month-select { border: none; background: transparent; font-size: 0.95rem; font-weight: 700; color: #1e293b; appearance: none; padding-right: 24px; cursor: pointer; outline: none; width: 100%; }
    .arrow-ico { position: absolute; right: 12px; pointer-events: none; width: 14px; color: #64748b; }
    .cal-ico { color: #3b82f6; }

    .user-profile { display: flex; align-items: center; gap: 12px; padding: 4px 12px; border-radius: 12px; cursor: pointer; transition: all 0.2s; border: 1px solid transparent; position: relative; }
    .user-profile:hover { background: #f8fafc; border-color: #f1f5f9; }
    .u-avatar { width: 44px; height: 44px; border-radius: 50%; background: #fbbf24; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: white; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2); }
    .u-info { display: flex; flex-direction: column; }
    .u-name { font-size: 0.95rem; font-weight: 800; color: #0f172a; line-height: 1.2; }
    .u-role { font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
    .u-arrow { width: 14px; color: #94a3b8; margin-left: 4px; transition: transform 0.2s; }
    .u-arrow.open { transform: rotate(180deg); }

    .user-profile-container { position: relative; }
    .user-dropdown {
      position: absolute;
      top: calc(100% + 12px);
      right: 0;
      width: 240px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 15px 35px rgba(0,0,0,0.12);
      border: 1px solid #f1f5f9;
      padding: 10px;
      z-index: 1000;
      animation: dropdownFade 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes dropdownFade {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .dropdown-header { padding: 8px 12px; }
    .d-label { font-size: 0.7rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }

    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 12px;
      border-radius: 10px;
      color: #475569;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .dropdown-item:hover { background: #f8fafc; color: #1e293b; }
    .dropdown-item svg { width: 18px; height: 18px; color: #94a3b8; flex-shrink: 0; }
    .dropdown-item.logout { color: #ef4444; }
    .dropdown-item.logout:hover { background: #fef2f2; }
    .dropdown-item.logout svg { color: #ef4444; }
    .dropdown-divider { height: 1px; background: #f1f5f9; margin: 4px 8px; }

    .header-notifications { position: relative; cursor: pointer; display: flex; align-items: center; gap: 8px; }
    .notif-btn { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: #64748b; cursor: pointer; transition: all 0.2s; }
    .notif-btn:hover { background: white; border-color: #3b82f6; color: #3b82f6; box-shadow: 0 4px 12px rgba(59,130,246,0.08); }
    .notif-btn svg { width: 22px; height: 22px; }
    .notif-badge {
      position: absolute;
      top: -6px;
      right: 18px;
      min-width: 22px;
      height: 22px;
      background: #ef4444;
      border: 3px solid white;
      border-radius: 50%;
      color: white;
      font-size: 0.7rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
    }
    .notif-arrow { width: 14px; color: #94a3b8; }

    /* Modal Form Styling */
    .form-core { background: white; width: 100%; border-radius: 12px; }
    .form-head { display: flex; align-items: center; gap: 14px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; }
    .ico-box { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
    .ico-box svg { width: 22px; height: 22px; }
    .usage-bg { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .baseline-bg { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .head-info h3 { font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0; }
    .head-info p { font-size: 0.85rem; color: #64748b; margin: 2px 0 0; font-weight: 500; }
    
    .form-body { display: flex; flex-direction: column; gap: 20px; }
    .field-item label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
    .field-item input { width: 100%; padding: 12px 16px; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; color: #1e293b; box-sizing: border-box; transition: all 0.2s; }
    .field-item input:focus { outline: none; border-color: #3b82f6; background: white; box-shadow: 0 0 0 4px rgba(59,130,246,0.1); }
    
    .submit-btn { width: 100%; padding: 14px; color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .submit-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }

    /* Confirm Card Styles */
    .confirm-card {
      background: white;
      width: 380px;
      padding: 40px 32px;
      border-radius: 24px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      animation: cardPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    @keyframes cardPop {
      from { transform: scale(0.8); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    .confirm-icon {
      width: 64px;
      height: 64px;
      background: #fee2e2;
      color: #ef4444;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .usage-bg { background: linear-gradient(135deg, #3b82f6, #2563eb); }
    .baseline-bg { background: linear-gradient(135deg, #f59e0b, #d97706); }
    .form-head h3 { font-size: 1.15rem; font-weight: 800; color: #1e293b; margin: 0; }
    .confirm-icon svg { width: 32px; height: 32px; }
    .confirm-card h3 { font-size: 1.5rem; font-weight: 800; color: #0f172a; margin: 0 0 12px; }
    .confirm-card p { color: #64748b; font-size: 1rem; margin: 0 0 32px; line-height: 1.6; }
    .confirm-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .btn-no { padding: 14px; border-radius: 12px; border: 1px solid #e2e8f0; background: white; color: #1e293b; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-no:hover { background: #f8fafc; }
    .btn-yes { padding: 14px; border-radius: 12px; border: none; background: #ef4444; color: white; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    .btn-yes:hover { background: #dc2626; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }

    .content-body { display: flex; flex-direction: column; gap: 24px; }
    .placeholder-view { padding: 60px; text-align: center; background: white; border-radius: 20px; border: 1px solid #e2e8f0; }
    .placeholder-view h2 { font-size: 1.5rem; font-weight: 900; color: #1e293b; margin-bottom: 12px; }
    .placeholder-view p { color: #64748b; }

    /* Modals */
    .modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 20px; backdrop-filter: blur(8px); }
    .modal-window { background: white; border-radius: 20px; padding: 24px; width: 480px; max-width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); position: relative; border: 1px solid #e2e8f0; }
    .modal-window.wide { width: 850px; }
    .modal-close { position: absolute; top: 16px; right: 16px; border: none; background: #f1f5f9; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; color: #64748b; font-size: 1.25rem; font-weight: 400; display: flex; align-items: center; justify-content: center; transition: all 0.2s; z-index: 10; }
    .modal-close:hover { background: #e2e8f0; color: #0f172a; transform: rotate(90deg); }

    /* Media Queries for Responsiveness */
    @media (max-width: 1280px) {
      .header-progress { width: 250px; }
      .search-hint { display: none; }
    }

    @media (max-width: 1100px) {
      .header-progress { display: none; }
      .header-search { max-width: 300px; }
    }

    @media (max-width: 1024px) {
      .sidebar {
        position: fixed;
        left: -280px;
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 2100;
      }
      .sidebar-open .sidebar { left: 0; }
      .sidebar-open .sidebar-backdrop { display: block; }
      
      .menu-toggle { display: flex; }
      .header-inner { padding: 12px 20px; gap: 16px; }
      .header-search { max-width: none; }
      
      .content-body { padding: 20px; }
    }

    @media (max-width: 768px) {
      .header-search { display: none; }
      .month-selector-group { display: none; }
      .user-profile { padding: 4px 8px; }
      .u-arrow { display: none; }
      .notif-arrow { display: none; }
    }

    @media (max-width: 640px) {
      .header-actions { gap: 12px; }
      .u-info { display: none; }
      .u-avatar { width: 40px; height: 40px; font-size: 1rem; }
      .notif-btn { width: 40px; height: 40px; }
      .notif-badge { right: 14px; top: -4px; width: 18px; height: 18px; font-size: 0.6rem; border-width: 2px; }
      
      .confirm-card { width: 100%; padding: 32px 20px; }
    }
  `]
})
export class AppComponent implements OnInit {
  @ViewChild('dashboard') dashboard!: any;
  @ViewChild('tenantsList') tenantsList!: any;
  
  selectedMonth = 'April';
  isLoggedIn = signal(false);
  currentUser = signal<any>(null);
  isAdmin = signal(false);
  
  activeModal: string | null = null;
  selectedTenant: any = null;
  
  isSidebarOpen = signal(false);
  activeView = signal('dashboard');
  isUserDropdownOpen = signal(false);
  notificationCount = signal(0);
  collectionProgress = signal(0);
  showLogoutConfirm = signal(false);

  months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  constructor(private waterService: WaterService) {}

  ngOnInit() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    this.selectedMonth = months[new Date().getMonth()];

    const user = this.waterService.getCurrentUserFromStorage();
    if (user) {
      this.onLogin(user);
    }
  }

  onLogin(user: any) {
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    this.isAdmin.set(user.role === 'ADMIN');
  }

  checkIsAdmin(user: any): boolean {
    return user && user.role === 'ADMIN';
  }

  logout() {
    this.waterService.clearCurrentUser();
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
    this.isAdmin.set(false);
    this.showLogoutConfirm.set(false);
    this.isUserDropdownOpen.set(false);
  }

  onMonthHeaderChange() {
    if (this.dashboard) this.dashboard.loadDataForMonth(this.selectedMonth);
    if (this.tenantsList) this.tenantsList.loadDataForMonth(this.selectedMonth);
  }

  openModal(type: string, tenant: any = null) {
    this.activeModal = type;
    this.selectedTenant = tenant || (this.isAdmin() ? null : this.currentUser());
    this.closeSidebar();
  }

  toggleSidebar() {
    this.isSidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.isSidebarOpen.set(false);
  }

  toggleUserDropdown() {
    this.isUserDropdownOpen.update(v => !v);
  }

  closeUserDropdown() {
    this.isUserDropdownOpen.set(false);
  }

  clearNotifications() {
    this.notificationCount.set(0);
  }

  updateProgress(val: number) {
    this.collectionProgress.set(val);
  }

  saveBaseline(units: number) {
    if (this.selectedTenant) {
      this.waterService.updateBaseline(this.selectedTenant.tenantId || this.selectedTenant.id, units).subscribe(() => {
        this.refreshAll();
      });
    }
  }

  confirmLogout() {
    this.showLogoutConfirm.set(true);
    this.isUserDropdownOpen.set(false);
  }

  cancelLogout() {
    this.showLogoutConfirm.set(false);
  }

  setView(view: string) {
    this.activeView.set(view);
    this.closeSidebar();
    this.closeUserDropdown();
  }

  closeModal() {
    this.activeModal = null;
    this.selectedTenant = null;
  }

  refreshAll() {
    if (this.dashboard) this.dashboard.loadDataForMonth(this.selectedMonth);
    if (this.tenantsList) this.tenantsList.loadDataForMonth(this.selectedMonth);
    
    // Simulate notification when new data arrives
    if (this.isAdmin()) {
      this.notificationCount.update(c => c + 1);
    }

    this.closeModal();
  }
}
