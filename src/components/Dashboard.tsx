import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, AreaChart, Area 
} from 'recharts';
import { 
  Activity, 
  CheckCircle2, 
  Package, 
  Calendar,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, Report } from '../types';

const COLORS = ['#0F4C81', '#F2A900', '#10B981', '#F43F5E', '#8B5CF6'];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [s, r] = await Promise.all([api.getStats(), api.getReports()]);
        setStats(s);
        setReports(r);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
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

  // Data processing for charts
  const areaData = ['Mặt Trời', 'Mặt Trăng', 'Diệu Kỳ', 'Nguồn Cội'].map(area => ({
    name: area,
    progress: Math.round(reports.filter(r => r.area === area && r.progress).reduce((acc, r) => acc + (r.progress || 0), 0) / (reports.filter(r => r.area === area && r.progress).length || 1))
  }));

  const festivalData = ['Mùa Xuân', 'Ẩm Thực và Bia', 'Mùa Thu', 'Mùa Đông'].map(fest => ({
    name: fest,
    value: reports.filter(r => r.festival === fest).length
  })).filter(f => f.value > 0);

  const stageData = ['Khảo sát', 'Lên ý tưởng thiết kế', 'Gia công sản phẩm', 'Thi công cảnh quan', 'Bàn giao'].map(stage => ({
    name: stage,
    count: reports.filter(r => r.stage === stage).length
  }));

  const productData = reports
    .filter(r => r.stage === 'Gia công sản phẩm')
    .reduce((acc: any[], r) => {
      const existing = acc.find(p => p.name === r.productType);
      if (existing) existing.value += (r.quantity || 0);
      else acc.push({ name: r.productType, value: r.quantity || 0 });
      return acc;
    }, []);

  const statCards = [
    { label: 'Tổng công việc', value: stats?.totalTasks, icon: Activity, color: 'bg-blue-50 text-blue-600' },
    { label: 'Tiến độ trung bình', value: `${stats?.avgProgress}%`, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Sản phẩm hoàn thành', value: stats?.productsCompleted, icon: Package, color: 'bg-amber-50 text-amber-600' },
    { label: 'Báo cáo hôm nay', value: stats?.reportsToday, icon: Calendar, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Progress by Area */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800">Tiến độ theo Khu vực</h3>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cập nhật realtime</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="progress" fill="#0F4C81" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress by Festival */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Tiến độ theo Festival</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={festivalData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {festivalData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Progress by Stage */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-8">Tiến độ theo Công đoạn</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stageData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F2A900" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F2A900" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                <Area type="monotone" dataKey="count" stroke="#F2A900" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Sản phẩm đã gia công</h3>
          <div className="overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-100">
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Loại sản phẩm</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Số lượng</th>
                  <th className="pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {productData.length > 0 ? productData.map((p, i) => (
                  <tr key={i} className="group hover:bg-slate-50 transition-colors">
                    <td className="py-4 text-sm font-semibold text-slate-700">{p.name}</td>
                    <td className="py-4 text-sm text-slate-600">{p.value}</td>
                    <td className="py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        Hoàn thành
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400 text-sm italic">Chưa có dữ liệu gia công</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
