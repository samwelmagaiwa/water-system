import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-wrapper">
      <div class="login-box">
        <div class="brand-top">
          <div class="app-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
            </svg>
          </div>
          <h1 class="brand-title">nexoryatech</h1>
          <p class="brand-tagline">Advanced Water Management System</p>
        </div>

        <div class="auth-section">
          <div class="auth-header">
            <h2>{{ registerMode() ? 'Create New Account' : 'Welcome Back' }}</h2>
            <p>{{ registerMode() ? 'Register your phone to access the system' : 'Sign in using your registered phone number' }}</p>
          </div>
          
          <form (ngSubmit)="handleSubmit()" class="auth-form">
            @if (registerMode()) {
              <div class="input-group">
                <label>Full Name</label>
                <input type="text" [(ngModel)]="name" name="name" placeholder="John Doe" class="field">
              </div>
            }

            <div class="input-group">
              <label>Phone Number</label>
              <input type="tel" [(ngModel)]="phone" name="phone" placeholder="255..." class="field">
            </div>

            @if (errorMsg()) { <div class="err">{{ errorMsg() }}</div> }

            <button type="submit" [disabled]="!phone || (registerMode() && !name) || loading()" class="act-btn">
              @if (loading()) { <span class="spinner"></span> }
              @else { {{ registerMode() ? 'Create Account' : 'Sign In' }} }
            </button>
          </form>

        </div>
      </div>
      <footer class="login-foot">
        &copy; 2026 nexoryatech. Designed for Excellence.
      </footer>
    </div>
  `,
  styles: [`
    .login-wrapper { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f1f5f9; padding: 20px; position: relative; }
    .login-wrapper::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); clip-path: polygon(0 0, 100% 0, 100% 35%, 0 65%); z-index: 1; }
    
    .login-box { background: white; border-radius: 16px; padding: 40px; width: 100%; max-width: 440px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); position: relative; z-index: 10; border: 1px solid #e2e8f0; }
    
    .brand-top { text-align: center; margin-bottom: 32px; }
    .app-logo { width: 56px; height: 56px; background: #2563eb; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; color: white; }
    .app-logo svg { width: 30px; height: 30px; }
    .brand-title { font-size: 1.6rem; font-weight: 800; color: #0f172a; margin: 0; letter-spacing: -0.5px; }
    .brand-tagline { font-size: 0.9rem; color: #64748b; margin: 4px 0 0; font-weight: 500; }
    
    .auth-header { margin-bottom: 24px; text-align: center; }
    .auth-header h2 { font-size: 1.25rem; font-weight: 800; color: #1e3a8a; margin: 0; }
    .auth-header p { font-size: 0.9rem; color: #64748b; margin: 6px 0 0; }
    
    .auth-form { display: flex; flex-direction: column; gap: 16px; }
    .input-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 8px; }
    .field { width: 100%; padding: 14px 16px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 1rem; color: #1e293b; background: #f8fafc; transition: all 0.2s; box-sizing: border-box; }
    .field:focus { outline: none; border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,0.1); }
    
    .err { background: #fef2f2; color: #dc2626; padding: 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; text-align: center; }
    
    .act-btn { width: 100%; padding: 16px; background: #2563eb; color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 800; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37,99,235,0.3); }
    .act-btn:hover:not(:disabled) { background: #1d4ed8; transform: translateY(-1px); }
    .act-btn:disabled { background: #cbd5e1; box-shadow: none; cursor: not-allowed; }
    
    .spinner { width: 20px; height: 20px; border: 3px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.8s linear infinite; display: inline-block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    
    .mode-toggle { text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #f1f5f9; }
    .mode-toggle p { font-size: 0.9rem; color: #64748b; margin: 0; }
    .mode-toggle button { background: none; border: none; color: #2563eb; font-weight: 700; cursor: pointer; padding: 0 4px; font-size: 0.9rem; }
    .mode-toggle button:hover { text-decoration: underline; }
    
    .login-foot { text-align: center; margin-top: 32px; font-size: 0.8rem; color: #94a3b8; font-weight: 500; position: relative; z-index: 10; }
  `]
})
export class LoginComponent implements OnInit {
  @Output() loggedIn = new EventEmitter<any>();
  name: string = ''; phone: string = ''; registerMode = signal(false); errorMsg = signal(''); loading = signal(false);
  constructor(private waterService: WaterService) {}
  ngOnInit() { const user = this.waterService.getCurrentUserFromStorage(); if (user) this.loggedIn.emit(user); }
  toggleMode() { this.registerMode.set(!this.registerMode()); this.errorMsg.set(''); }
  handleSubmit() {
    this.loading.set(true); this.errorMsg.set('');
    const action = this.registerMode() ? this.waterService.register(this.name, this.phone) : this.waterService.login(this.phone);
    action.subscribe({ next: (u) => { this.waterService.setCurrentUser(u); this.loading.set(false); this.loggedIn.emit(u); }, error: () => { this.loading.set(false); this.errorMsg.set(this.registerMode() ? 'Registration failed.' : 'Phone not found.'); } });
  }
}