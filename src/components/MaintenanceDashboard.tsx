import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { 
  Activity, 
  Droplets, 
  MapPin, 
  Layers, 
  ImageIcon,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, Report } from '../types';

const COLORS = ['#4CAF50', '#81C784', '#2E7D32', '#A5D6A7', '#66BB6A', '#43A047', '#1B5E20', '#8BC34A', '#CDDC39'];

interface MaintenanceDashboardProps {
  onNavigate: (tab: string, filters?: any) => void;
}

export default function MaintenanceDashboard({ onNavigate }: MaintenanceDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [s, r] = await Promise.all([
        api.getStats(), 
        api.getReports()
      ]);
      setStats(s);
      setReports(r.filter(rep => rep.module === 'Bảo dưỡng'));
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
      if (data.type === 'STATS_UPDATE' || data.type === 'NEW_REPORT' || data.type === 'UPDATE_REPORT') {
        fetchData();
      }
    };
    return () => ws.close();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64">Đang tải dữ liệu...</div>;

  // Chart 1: Theo loại công việc chăm sóc
  const maintenanceTypeData = reports.reduce((acc: any[], r) => {
    const type = r.maintenanceType === 'Khác' ? (r.customMaintenanceType || 'Khác') : (r.maintenanceType || 'Chưa phân loại');
    const existing = acc.find(item => item.name === type);
    if (existing) existing.value++;
    else acc.push({ name: type, value: 1 });
    return acc;
  }, []);

  // Chart 2: Theo phân loại cây
  const plantCategoryData = reports.reduce((acc: any[], r) => {
    const cat = r.plantCategory || 'Chưa phân loại';
    const existing = acc.find(item => item.name === cat);
    if (existing) existing.value++;
    else acc.push({ name: cat, value: 1 });
    return acc;
  }, []);

  // Chart 3: Theo 4 vùng đất
  const landZoneData = reports.reduce((acc: any[], r) => {
    const zone = r.landZone || 'Chưa phân loại';
    const existing = acc.find(item => item.name === zone);
    if (existing) existing.value++;
    else acc.push({ name: zone, value: 1 });
    return acc;
  }, []);

  // Chart 4: Theo khu vực
  const areaData = reports.reduce((acc: any[], r) => {
    const area = r.area || 'Chưa phân loại';
    const existing = acc.find(item => item.name === area);
    if (existing) existing.value++;
    else acc.push({ name: area, value: 1 });
    return acc;
  }, []);

  // Chart 5: Theo tình trạng cây
  const plantStatusData = reports.reduce((acc: any[], r) => {
    const status = r.plantStatus || 'Chưa phân loại';
    const existing = acc.find(item => item.name === status);
    if (existing) existing.value++;
    else acc.push({ name: status, value: 1 });
    return acc;
  }, []);

  // Chart 6: Số công theo ngày
  const dailyManDaysData = reports.reduce((acc: any[], r) => {
    const date = r.reportDate;
    const existing = acc.find(item => item.date === date);
    if (existing) existing.value += (r.manDays || 0);
    else acc.push({ date, value: (r.manDays || 0) });
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date));

  const maintenanceStatCards = [
    { label: 'Báo cáo hôm nay', value: stats?.maintenance?.totalReports, icon: Calendar, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Tổng số công', value: stats?.maintenance?.totalManDays, icon: TrendingUp, color: 'bg-blue-50 text-blue-600' },
    { label: 'Khu vực thực hiện', value: stats?.maintenance?.totalAreas, icon: MapPin, color: 'bg-amber-50 text-amber-600' },
    { label: 'Khối lượng chăm sóc', value: stats?.maintenance?.totalQuantity, icon: Activity, color: 'bg-purple-50 text-purple-600' },
    { label: 'Hình ảnh cập nhật', value: stats?.maintenance?.totalPhotos, icon: ImageIcon, color: 'bg-pink-50 text-pink-600' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
          <Droplets size={24} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Dashboard Chăm sóc – Bảo dưỡng</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {maintenanceStatCards.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports', { filterModule: 'Bảo dưỡng' })}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Loại công việc */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports', { filterModule: 'Bảo dưỡng' })}>
          <h3 className="text-lg font-bold text-slate-800 mb-8">Theo loại công việc chăm sóc</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={maintenanceTypeData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {maintenanceTypeData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Phân loại cây */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports', { filterModule: 'Bảo dưỡng' })}>
          <h3 className="text-lg font-bold text-slate-800 mb-8">Theo phân loại cây</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={plantCategoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#4CAF50" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Theo 4 vùng đất */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports', { filterModule: 'Bảo dưỡng' })}>
          <h3 className="text-lg font-bold text-slate-800 mb-8">Theo 4 vùng đất</h3>
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

        {/* Chart 4: Theo khu vực */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports', { filterModule: 'Bảo dưỡng' })}>
          <h3 className="text-lg font-bold text-slate-800 mb-8">Theo khu vực</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#2E7D32" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Tình trạng cây */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports', { filterModule: 'Bảo dưỡng' })}>
          <h3 className="text-lg font-bold text-slate-800 mb-8">Theo tình trạng cây / cảnh quan</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={plantStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  {plantStatusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Số công theo ngày */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('reports', { filterModule: 'Bảo dưỡng' })}>
          <h3 className="text-lg font-bold text-slate-800 mb-8">Số công theo ngày</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyManDaysData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Line type="monotone" dataKey="value" stroke="#4CAF50" strokeWidth={3} dot={{ fill: '#4CAF50', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
