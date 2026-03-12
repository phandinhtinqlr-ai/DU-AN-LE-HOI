import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp,
  Sprout,
  Clock,
  Users
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, Report } from '../types';

const LANDSCAPE_COLORS = ['#2E7D32', '#4CAF50', '#81C784', '#A5D6A7', '#C8E6C9'];

export default function LandscapeDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [s, r, set] = await Promise.all([
        api.getStats(), 
        api.getReports(),
        api.getSettings()
      ]);
      setStats(s);
      setReports(r);
      setSettings(set);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Real-time refresh
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'STATS_UPDATE' || data.type === 'NEW_REPORT' || data.type === 'UPDATE_REPORT' || data.type === 'SETTINGS_UPDATE') {
        fetchData();
      }
    };
    return () => ws.close();
  }, []);

  if (loading || !settings) return <div className="flex items-center justify-center h-64">Đang tải dữ liệu...</div>;

  const landscapeReports = reports.filter(r => r.module === 'Cảnh quan');

  const treeSourceData = [
    { name: 'Cây mua ngoài', value: landscapeReports.filter(r => r.treeSource === 'Cây mua ngoài').reduce((acc, r) => acc + (r.treeQuantity || 0), 0) },
    { name: 'Sản xuất', value: landscapeReports.filter(r => r.treeSource === 'Sản xuất').reduce((acc, r) => acc + (r.treeQuantity || 0), 0) },
    { name: 'Hasfarm', value: landscapeReports.filter(r => r.treeSource === 'Hasfarm').reduce((acc, r) => acc + (r.treeQuantity || 0), 0) }
  ].filter(d => d.value > 0);

  const treeClassificationData = [
    { name: 'Cây lớn', value: landscapeReports.filter(r => r.treeClassification === 'Cây lớn').reduce((acc, r) => acc + (r.treeQuantity || 0), 0) },
    { name: 'Cây bụi', value: landscapeReports.filter(r => r.treeClassification === 'Cây bụi').reduce((acc, r) => acc + (r.treeQuantity || 0), 0) },
    { name: 'Cây hoa thảm', value: landscapeReports.filter(r => r.treeClassification === 'Cây hoa thảm').reduce((acc, r) => acc + (r.treeQuantity || 0), 0) }
  ];

  const landZoneData = [
    { name: 'Vùng đất 1', value: landscapeReports.filter(r => r.landZone === 'Vùng đất 1').length },
    { name: 'Vùng đất 2', value: landscapeReports.filter(r => r.landZone === 'Vùng đất 2').length },
    { name: 'Vùng đất 3', value: landscapeReports.filter(r => r.landZone === 'Vùng đất 3').length },
    { name: 'Vùng đất 4', value: landscapeReports.filter(r => r.landZone === 'Vùng đất 4').length }
  ];

  const areaManDaysData = (settings.areas || []).map((area: string) => ({
    name: area,
    value: Math.round(landscapeReports.filter(r => r.area === area).reduce((acc, r) => acc + (r.manDays || 0), 0) * 10) / 10
  }));

  const landscapeStatCards = [
    { label: 'Tổng số cây thay thế', value: stats?.landscape?.totalTrees, icon: Sprout, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Tổng số công thực hiện', value: stats?.landscape?.totalManDays, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
    { label: 'Tổng số giờ thi công', value: stats?.landscape?.totalHours, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Tổng số người tham gia', value: stats?.landscape?.totalWorkers, icon: Users, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
          <Sprout size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Cảnh quan</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {landscapeStatCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tree by Source */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Biểu đồ cây theo nguồn</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={treeSourceData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {treeSourceData.map((entry, index) => <Cell key={`cell-${index}`} fill={LANDSCAPE_COLORS[index % LANDSCAPE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tree by Classification */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Biểu đồ theo phân loại cây</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={treeClassificationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} width={100} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#4CAF50" radius={[0, 8, 8, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* By 4 Land Zones */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Biểu đồ theo 4 vùng đất</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={landZoneData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#81C784" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Man Days by Area */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Biểu đồ số công theo khu vực</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaManDaysData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#2E7D32" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
