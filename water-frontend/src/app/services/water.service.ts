import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WaterService {
  private apiUrl = 'http://localhost:8081/api/v1';
  private currentUserKey = 'aquaflow_user';

  constructor(private http: HttpClient) { }

  register(name: string, phone: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { name, phone });
  }

  login(phone: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { phone });
  }

  getCurrentUser(tenantId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/current-user?tenantId=${tenantId}`);
  }

  setCurrentUser(user: any): void {
    localStorage.setItem(this.currentUserKey, JSON.stringify(user));
  }

  getCurrentUserFromStorage(): any {
    const user = localStorage.getItem(this.currentUserKey);
    return user ? JSON.parse(user) : null;
  }

  clearCurrentUser(): void {
    localStorage.removeItem(this.currentUserKey);
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUserFromStorage();
  }

  getTenants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tenants`);
  }

  getDashboard(month: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard?month=${month}`);
  }

  getUsage(month: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/usage?month=${month}`);
  }

  addUnits(data: { tenantId: number; month: string; units: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/units`, data);
  }

  getTenantUnits(tenantId: number, month: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tenant-units?tenantId=${tenantId}&month=${month}`);
  }

  setBill(month: string, totalBill: number, totalUnits: number | null): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/bill`, { month, totalBill, totalUnits });
  }

  getPayments(month: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/payments?month=${month}`);
  }

  addPayment(data: { tenantId: number; amount: number; month: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/payments`, data);
  }

  getTenantSummary(month: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tenant-summary?month=${month}`);
  }

  checkAdmin(phone: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin-check`, { phone });
  }

  createTenant(data: { name: string; phone: string; role: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tenants/create`, data);
  }

  updateTenant(id: number, data: { name: string; phone: string; role: string }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/tenants/${id}`, data);
  }

  deleteTenant(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/tenants/${id}`);
  }

  updateBaseline(id: number, units: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/tenants/${id}/baseline`, { previousUnits: units });
  }
}
