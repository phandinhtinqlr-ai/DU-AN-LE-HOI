import React from 'react';
import { 
  Users, 
  User,
  UserCheck, 
  UserPlus, 
  UserMinus, 
  Clock, 
  TrendingUp,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Cake,
  Gift
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { motion } from 'motion/react';
import { Employee, HRStats } from '../types';
import { format } from 'date-fns';

interface HRDashboardProps {
  employees: Employee[];
  stats: HRStats;
}

const COLORS = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

export default function HRDashboard({ employees, stats }: HRDashboardProps) {
  // Data for Charts
  const typeData = [
    { name: 'Nhân viên', value: stats.totalEmployees },
    { name: 'Công nhật', value: stats.totalDailyWorkers }
  ];

  const genderData = [
    { name: 'Nam', value: employees.filter(e => e.gender === 'Nam').length },
    { name: 'Nữ', value: employees.filter(e => e.gender === 'Nữ').length },
    { name: 'Khác', value: employees.filter(e => e.gender === 'Khác').length }
  ];

  const teamData = [
    { name: 'Văn phòng', value: employees.filter(e => e.teamGroup === 'Văn phòng').length },
    { name: 'Sản xuất', value: employees.filter(e => e.teamGroup === 'Sản xuất').length },
    { name: 'Thi công', value: employees.filter(e => e.teamGroup === 'Thi công').length },
    { name: 'Bảo dưỡng', value: employees.filter(e => e.teamGroup === 'Chăm sóc bảo dưỡng').length },
    { name: 'Chuyên môn', value: employees.filter(e => e.teamGroup === 'Chuyên môn').length }
  ];

  const statusData = [
    { name: 'Đang làm việc', value: stats.working },
    { name: 'Tạm nghỉ', value: stats.onLeave },
    { name: 'Nghỉ việc', value: stats.resigned }
  ];

  const calculateTenureMonths = (joinDate: string) => {
    const start = new Date(joinDate);
    const now = new Date();
    return (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  };

  const tenureData = [
    { name: 'Dưới 6 tháng', value: employees.filter(e => calculateTenureMonths(e.joinDate) < 6).length },
    { name: '6 tháng - 1 năm', value: employees.filter(e => {
      const m = calculateTenureMonths(e.joinDate);
      return m >= 6 && m < 12;
    }).length },
    { name: '1 - 3 năm', value: employees.filter(e => {
      const m = calculateTenureMonths(e.joinDate);
      return m >= 12 && m < 36;
    }).length },
    { name: 'Trên 3 năm', value: employees.filter(e => calculateTenureMonths(e.joinDate) >= 36).length }
  ];

  const kpis = [
    { label: 'Tổng số nhân sự', value: stats.totalPersonnel, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Tổng số nhân viên', value: stats.totalEmployees, icon: UserCheck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Tổng số công nhật', value: stats.totalDailyWorkers, icon: UserPlus, color: 'text-sky-600', bg: 'bg-sky-100' },
    { label: 'Đang làm việc', value: stats.working, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Tạm nghỉ', value: stats.onLeave, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Nghỉ việc', value: stats.resigned, icon: UserMinus, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  const getBirthdays = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayList: Employee[] = [];
    const upcomingList: { employee: Employee, daysLeft: number }[] = [];

    employees.forEach(e => {
      if (!e.dateOfBirth) return;
      const dob = new Date(e.dateOfBirth);
      const bday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
      
      let diff = Math.ceil((bday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diff < 0) {
        const nextYearBday = new Date(today.getFullYear() + 1, dob.getMonth(), dob.getDate());
        diff = Math.ceil((nextYearBday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      if (diff === 0) {
        todayList.push(e);
      } else if (diff > 0 && diff <= 3) {
        upcomingList.push({ employee: e, daysLeft: diff });
      }
    });

    return { todayList, upcomingList };
  };

  const { todayList, upcomingList } = getBirthdays();

  return (
    <div className="space-y-8">
      {/* Birthday Alerts */}
      {(todayList.length > 0 || upcomingList.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayList.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-[32px] shadow-xl shadow-blue-200 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Cake size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Cake size={20} />
                  </div>
                  <h3 className="text-lg font-bold">Sinh nhật hôm nay! 🎂</h3>
                </div>
                <div className="space-y-2">
                  {todayList.map(e => (
                    <div key={e.id} className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/20 shrink-0">
                        {e.profileImageUrl ? (
                          <img src={e.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><User size={16} /></div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{e.fullName}</p>
                        <p className="text-[10px] font-medium opacity-70 uppercase tracking-widest">{e.employeeCode} • {e.teamGroup}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {upcomingList.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-[32px] shadow-sm border border-blue-100 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 text-blue-100">
                <Gift size={80} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Gift size={20} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">Sắp tới sinh nhật (3 ngày)</h3>
                </div>
                <div className="space-y-2">
                  {upcomingList.map(({ employee, daysLeft }) => (
                    <div key={employee.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white shrink-0">
                          {employee.profileImageUrl ? (
                            <img src={employee.profileImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={16} /></div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{employee.fullName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{employee.employeeCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-blue-600">Còn {daysLeft} ngày</p>
                        <p className="text-[10px] font-bold text-slate-400">{format(new Date(employee.dateOfBirth), 'dd/MM')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className={`w-12 h-12 ${kpi.bg} ${kpi.color} rounded-2xl flex items-center justify-center mb-4`}>
              <kpi.icon size={24} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{kpi.label}</p>
            <p className="text-2xl font-black text-slate-800">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Employee Type Donut */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Theo phân loại nhân sự</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Pie */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
              <PieChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Theo giới tính</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {genderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Bar Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
              <BarChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Theo đội nhóm</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Work Status Bar Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
              <BarChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Theo tình trạng làm việc</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tenure Bar Chart */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
              <BarChartIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Theo thâm niên</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tenureData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#60a5fa" radius={[4, 4, 0, 0]} barSize={60} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
