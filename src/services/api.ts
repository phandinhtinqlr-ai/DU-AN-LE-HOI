import { Report, DashboardStats } from '../types';

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
  async getStats(): Promise<DashboardStats> {
    const res = await fetch('/api/stats');
    return res.json();
  },
  async getSettings(): Promise<any> {
    const res = await fetch('/api/settings');
    return res.json();
  },
  async updateSettings(key: string, value: string[]): Promise<void> {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
  }
};
