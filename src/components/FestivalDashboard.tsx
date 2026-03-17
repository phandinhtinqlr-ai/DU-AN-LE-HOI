import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Activity, 
  Package, 
  Calendar,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, Report } from '../types';

const COLORS = ['#0F4C81', '#F2A900', '#10B981', '#F43F5E', '#8B5CF6'];

interface FestivalDashboardProps {
  onNavigate: (tab: string, filters?: any) => void;
}

export default function FestivalDashboard({ onNavigate }: FestivalDashboardProps) {
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

  const festivalReports = reports.filter(r => r.module === 'Lễ hội' || !r.module);

  const areaData = (settings.areas || []).map((area: string) => ({
    name: area,
    progress: Math.round(festivalReports.filter(r => r.area === area && r.progress).reduce((acc, r) => acc + (r.progress || 0), 0) / (festivalReports.filter(r => r.area === area && r.progress).length || 1))
  }));

  const festivalData = (settings.festivals || []).map((fest: string) => ({
    name: fest,
    value: festivalReports.filter(r => r.festival === fest).length
  })).filter(f => f.value > 0);

  const statCards = [
    { label: 'Tổng công việc', value: stats?.totalTasks, icon: Activity, color: 'bg-blue-50 text-blue-600' },
    { label: 'Tiến độ trung bình', value: `${stats?.avgProgress}%`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Sản phẩm hoàn thành', value: stats?.productsCompleted, icon: Package, color: 'bg-amber-50 text-amber-600' },
    { label: 'Báo cáo hôm nay', value: stats?.reportsToday, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
          <Activity size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Lễ hội</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports', { filterModule: 'Lễ hội' })}>
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
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports', { filterModule: 'Lễ hội' })}>
          <h3 className="text-lg font-bold text-slate-800 mb-8">Tiến độ theo Khu vực</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="progress" fill="#0F4C81" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports', { filterModule: 'Lễ hội' })}>
          <h3 className="text-lg font-bold text-slate-800 mb-8">Tiến độ theo Festival</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={festivalData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {festivalData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
