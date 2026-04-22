import { Component, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="logo-section">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
            </svg>
          </div>
          <h1>AquaFlow</h1>
          <p>Water Billing System</p>
        </div>

        <div class="form-section">
          @if (registerMode()) {
            <div class="form-header">
              <h2>Create Account</h2>
              <p>Enter your details to get started</p>
            </div>
            
            <div class="form-group">
              <label>Your Name</label>
              <input 
                type="text" 
                [(ngModel)]="name" 
                placeholder="Enter your full name"
                class="form-input"
              >
            </div>
          } @else {
            <div class="form-header">
              <h2>Welcome Back</h2>
              <p>Sign in to continue</p>
            </div>
          }

          <div class="form-group">
            <label>Phone Number</label>
            <input 
              type="tel" 
              [(ngModel)]="phone" 
              placeholder="Enter phone number"
              class="form-input"
            >
          </div>

          @if (errorMsg()) {
            <div class="error-message">{{ errorMsg() }}</div>
          }

          <button 
            type="button" 
            (click)="handleSubmit()" 
            [disabled]="!phone || (registerMode() && !name) || loading()"
            class="submit-button"
          >
            @if (loading()) {
              <span class="spinner"></span>
            } @else {
              {{ registerMode() ? 'Create Account' : 'Sign In' }}
            }
          </button>

          <div class="switch-mode">
            @if (registerMode()) {
              <p>Already have an account? <button type="button" (click)="toggleMode()">Sign In</button></p>
            } @else {
              <p>New user? <button type="button" (click)="toggleMode()">Create Account</button></p>
            }
          </div>
        </div>
      </div>

      <div class="login-footer">
        <p>&copy; 2026 AquaFlow Management System</p>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(180deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    
    .login-page::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px;
      animation: grid 20s linear infinite;
    }
    
    @keyframes grid {
      0% { transform: translate(0, 0); }
      100% { transform: translate(40px, 40px); }
    }
    
    .login-card {
      background: white;
      border-radius: 16px;
      padding: 28px 24px;
      width: 100%;
      max-width: 320px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      position: relative;
      z-index: 10;
    }
    
    .logo-section {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .logo-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 10px;
    }
    
    .logo-icon svg {
      width: 26px;
      height: 26px;
      color: white;
    }
    
    .logo-section h1 {
      font-size: 1.25rem;
      font-weight: 800;
      color: #1e293b;
      margin: 0;
    }
    
    .logo-section p {
      font-size: 0.75rem;
      color: #64748b;
      margin: 2px 0 0;
    }
    
    .form-header {
      text-align: center;
      margin-bottom: 16px;
    }
    
    .form-header h2 {
      font-size: 1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    
    .form-header p {
      font-size: 0.75rem;
      color: #64748b;
      margin: 2px 0 0;
    }
    
    .form-group {
      margin-bottom: 12px;
    }
    
    .form-group label {
      display: block;
      font-size: 0.75rem;
      font-weight: 600;
      color: #475569;
      margin-bottom: 4px;
    }
    
    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.9rem;
      color: #1e293b;
      transition: all 0.2s;
      box-sizing: border-box;
    }
    
    .form-input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59,130,246,0.1);
    }
    
    .form-input::placeholder {
      color: #94a3b8;
    }
    
    .error-message {
      background: #fef2f2;
      color: #dc2626;
      padding: 8px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      margin-bottom: 10px;
    }
    
    .submit-button {
      width: 100%;
      padding: 12px;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      transition: all 0.2s;
    }
    
    .submit-button:hover:not(:disabled) {
      transform: translateY(-1px);
    }
    
    .submit-button:disabled {
      background: #cbd5e1;
      cursor: not-allowed;
    }
    
    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
.switch-mode {
      text-align: center;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
    }
    
    .switch-mode p {
      font-size: 0.75rem;
      color: #64748b;
      margin: 0;
    }
    
    .switch-mode button {
      background: none;
      border: none;
      color: #3b82f6;
      font-weight: 600;
      cursor: pointer;
      font-size: 0.75rem;
    }
    
    .switch-mode button:hover {
      text-decoration: underline;
    }
    
    .login-footer {
      text-align: center;
      margin-top: 16px;
      position: relative;
      z-index: 10;
    }
    
    .login-footer p {
      font-size: 0.7rem;
      color: rgba(255,255,255,0.6);
    }
  `]
})
export class LoginComponent implements OnInit {
  @Output() loggedIn = new EventEmitter<any>();
  
  name: string = '';
  phone: string = '';
  registerMode = signal(false);
  errorMsg = signal('');
  loading = signal(false);

  constructor(private waterService: WaterService) {}

  ngOnInit() {
    const user = this.waterService.getCurrentUserFromStorage();
    if (user) {
      this.loggedIn.emit(user);
    }
  }

  toggleMode() {
    this.registerMode.set(!this.registerMode());
    this.errorMsg.set('');
  }

  handleSubmit() {
    this.loading.set(true);
    this.errorMsg.set('');

    const action = this.registerMode() 
      ? this.waterService.register(this.name, this.phone)
      : this.waterService.login(this.phone);

    action.subscribe({
      next: (user) => {
        this.waterService.setCurrentUser(user);
        this.loading.set(false);
        this.loggedIn.emit(user);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(this.registerMode() 
          ? 'Registration failed. Please try again.' 
          : 'User not found. Please create an account.');
      }
    });
  }
}