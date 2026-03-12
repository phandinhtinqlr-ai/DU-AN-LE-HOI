import { Report, DashboardStats, Employee } from '../types';

export const api = {
  async getReports(): Promise<Report[]> {
    const res = await fetch('/api/reports');
    return res.json();
  },
  async createReport(report: Report): Promise<Report> {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    return res.json();
  },
  async updateReport(id: number, report: Report): Promise<Report> {
    const res = await fetch(`/api/reports/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(report),
    });
    return res.json();
  },
  async deleteReport(id: number): Promise<void> {
    await fetch(`/api/reports/${id}`, { method: 'DELETE' });
  },
  async getEmployees(): Promise<Employee[]> {
    const res = await fetch('/api/employees');
    return res.json();
  },
  async createEmployee(employee: Employee): Promise<Employee> {
    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create employee');
    }
    return res.json();
  },
  async updateEmployee(id: number, employee: Employee): Promise<Employee> {
    const res = await fetch(`/api/employees/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(employee),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to update employee');
    }
    return res.json();
  },
  async deleteEmployee(id: number): Promise<void> {
    await fetch(`/api/employees/${id}`, { method: 'DELETE' });
  },
  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats');
    return res.json();
  },
  async getSettings(): Promise<any> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },
  async updateSettings(key: string, value: string[]): Promise<void> {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'Failed to update settings');
    }
  }
};
