import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings as SettingsIcon, 
  Bell, 
  Menu, 
  X, 
  Plus,
  LogOut,
  ChevronRight,
  Activity,
  Sprout,
  Droplets,
  ChevronDown,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import FestivalDashboard from './components/FestivalDashboard';
import LandscapeDashboard from './components/LandscapeDashboard';
import MaintenanceDashboard from './components/MaintenanceDashboard';
import HRDashboard from './components/HRDashboard';
import LogForm from './components/LogForm';
import MaintenanceForm from './components/MaintenanceForm';
import HRForm from './components/HRForm';
import ReportTable from './components/ReportTable';
import MaintenanceReportTable from './components/MaintenanceReportTable';
import HRTable from './components/HRTable';
import HRDetail from './components/HRDetail';
import SettingsView from './components/Settings';
import Toast, { ToastType } from './components/Toast';
import { Report, ModuleType, Employee } from './types';
import { api } from './services/api';

interface ToastMessage {
  id: string | number;
  message: string;
  type: ToastType;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'reports' | 'settings'>('dashboard');
  const [activeModule, setActiveModule] = useState<ModuleType>('Nhân sự');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [isModuleMenuOpen, setIsModuleMenuOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [hrStats, setHrStats] = useState<any>(null);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setToasts(prev => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string | number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const fetchHRData = useCallback(async () => {
    if (activeModule === 'Nhân sự') {
      try {
        const [empData, statsData] = await Promise.all([
          api.getEmployees(),
          api.getStats()
        ]);
        setEmployees(empData);
        setHrStats(statsData.hr);
      } catch (error) {
        console.error(error);
      }
    }
  }, [activeModule]);

  useEffect(() => {
    fetchHRData();
  }, [fetchHRData]);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    let ws: WebSocket | null = null;

    const connectWS = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            let msg = '';
            if (data.type === 'NEW_REPORT') {
              msg = `Báo cáo mới từ ${data.payload.reporter} - ${data.payload.area}`;
              addToast(msg, 'success');
            } else if (data.type === 'UPDATE_REPORT') {
              msg = `Cập nhật báo cáo từ ${data.payload.reporter} - ${data.payload.area}`;
              addToast(msg, 'info');
            } else if (data.type === 'NEW_EMPLOYEE') {
              msg = `Hồ sơ nhân sự mới: ${data.payload.fullName}`;
              addToast(msg, 'success');
              fetchHRData();
            } else if (data.type === 'UPDATE_EMPLOYEE') {
              msg = `Cập nhật hồ sơ: ${data.payload.fullName}`;
              addToast(msg, 'info');
              fetchHRData();
            } else if (data.type === 'SETTINGS_UPDATE') {
              msg = `Cấu hình hệ thống (${data.key}) vừa được thay đổi`;
              addToast(msg, 'info');
            } else if (data.type === 'STATS_UPDATE') {
              fetchHRData();
            }
            if (msg) {
              setNotifications(prev => [msg, ...prev].slice(0, 10));
            }
          } catch (e) {
            console.error("Failed to parse WebSocket message:", e);
          }
        };
        ws.onclose = () => {
          setTimeout(connectWS, 3000); // Auto reconnect
        };
        ws.onerror = (error) => {
          console.warn("WebSocket connection issue.");
        };
      } catch (e) {
        console.error("WebSocket initialization failed:", e);
      }
    };

    connectWS();

    return () => {
      if (ws) ws.close();
    };
  }, [addToast, fetchHRData]);

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setActiveTab('form');
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setActiveTab('form');
  };

  const handleDeleteEmployee = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hồ sơ này?')) {
      try {
        await api.deleteEmployee(id);
        addToast('Đã xóa hồ sơ nhân sự', 'success');
        fetchHRData();
        setViewingEmployee(null);
      } catch (error) {
        addToast('Lỗi khi xóa hồ sơ', 'error');
      }
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { 
      id: 'form', 
      label: activeModule === 'Nhân sự' ? 'Thêm Nhân Sự' : 'Nhập Nhật Ký', 
      icon: Plus 
    },
    { 
      id: 'reports', 
      label: activeModule === 'Nhân sự' ? 'Danh Sách Nhân Sự' : 'Quản Lý Báo Cáo', 
      icon: activeModule === 'Nhân sự' ? Users : FileText 
    },
    { id: 'settings', label: 'Cấu Hình', icon: SettingsIcon },
  ];

  const getModuleColor = (module: ModuleType) => {
    switch(module) {
      case 'Nhân sự': return 'bg-blue-600';
      case 'Lễ hội': return 'bg-blue-500';
      case 'Cảnh quan': return 'bg-emerald-500';
      case 'Bảo dưỡng': return 'bg-green-600';
      default: return 'bg-primary';
    }
  };

  const getModuleIcon = (module: ModuleType) => {
    switch(module) {
      case 'Nhân sự': return <Users size={18} />;
      case 'Lễ hội': return <Activity size={18} />;
      case 'Cảnh quan': return <Sprout size={18} />;
      case 'Bảo dưỡng': return <Droplets size={18} />;
      default: return <Activity size={18} />;
    }
  };

  return (
    <div className={`flex h-screen overflow-hidden ${activeModule === 'Nhân sự' ? 'bg-bg-app' : 'bg-bg-app'}`}>
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } ${activeModule === 'Nhân sự' ? 'bg-primary' : 'bg-primary'} text-white transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className={`w-8 h-8 ${activeModule === 'Nhân sự' ? 'bg-accent' : 'bg-accent'} rounded-lg flex items-center justify-center shrink-0`}>
            <span className={`font-bold ${activeModule === 'Nhân sự' ? 'text-primary' : 'text-primary'}`}>SW</span>
          </div>
          {isSidebarOpen && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-bold text-sm tracking-tight"
            >
              BA NA HILLS
            </motion.span>
          )}
        </div>

        {/* Module Switcher */}
        <div className="px-3 py-4 border-b border-white/10">
          <div className="relative">
              <button 
                onClick={() => setIsModuleMenuOpen(!isModuleMenuOpen)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  isModuleMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getModuleColor(activeModule)}`}>
                  {getModuleIcon(activeModule)}
                </div>
                {isSidebarOpen && (
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Module Hiện Tại</p>
                    <p className="text-sm font-bold truncate">
                      {activeModule === 'Nhân sự' ? 'Hồ Sơ Nhân Sự' :
                       activeModule === 'Lễ hội' ? 'Thi Công Lễ Hội' : 
                       activeModule === 'Cảnh quan' ? 'Thi Công Cảnh Quan' : 'Chăm Sóc – Bảo Dưỡng'}
                    </p>
                  </div>
                )}
                {isSidebarOpen && <ChevronDown size={16} className={`transition-transform ${isModuleMenuOpen ? 'rotate-180' : ''}`} />}
              </button>

              <AnimatePresence>
                {isModuleMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-[60] overflow-hidden"
                  >
                    {[
                      { id: 'Nhân sự', label: 'Hồ Sơ Nhân Sự', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { id: 'Lễ hội', label: 'Thi Công Lễ Hội', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { id: 'Cảnh quan', label: 'Thi Công Cảnh Quan', icon: Sprout, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { id: 'Bảo dưỡng', label: 'Chăm Sóc – Bảo Dưỡng', icon: Droplets, color: 'text-green-600', bg: 'bg-green-50' }
                    ].map(mod => (
                      <button 
                        key={mod.id}
                        onClick={() => {
                          setActiveModule(mod.id as ModuleType);
                          setIsModuleMenuOpen(false);
                          setActiveTab('dashboard');
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                          activeModule === mod.id ? `${mod.bg} ${mod.color}` : 'hover:bg-slate-50 text-slate-600'
                        }`}
                      >
                        <mod.icon size={18} />
                        <span className="text-sm font-bold">{mod.label}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (item.id !== 'form') {
                  setEditingReport(null);
                  setEditingEmployee(null);
                }
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                activeTab === item.id 
                  ? (activeModule === 'Nhân sự' ? 'bg-accent text-primary font-semibold' : 'bg-accent text-primary font-semibold')
                  : 'hover:bg-white/10 text-white/70'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 text-white/70 transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            {isSidebarOpen && <span>Thu gọn</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              activeModule === 'Nhân sự' ? 'bg-blue-100 text-blue-600' :
              activeModule === 'Lễ hội' ? 'bg-blue-100 text-blue-600' : 
              activeModule === 'Cảnh quan' ? 'bg-emerald-100 text-emerald-600' : 'bg-green-100 text-green-600'
            }`}>
              {activeModule === 'Bảo dưỡng' ? 'Chăm Sóc – Bảo Dưỡng' : 
               activeModule === 'Nhân sự' ? 'Hồ Sơ Nhân Sự' : activeModule}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {/* Notification Dropdown */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông báo gần đây</span>
                  <button onClick={() => setNotifications([])} className="text-xs text-primary hover:underline">Xoá hết</button>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {notifications.length > 0 ? notifications.map((n, i) => (
                    <div key={i} className="text-sm text-slate-600 p-3 bg-slate-50 rounded-xl border-l-4 border-accent">
                      {n}
                    </div>
                  )) : (
                    <p className="text-center text-slate-400 py-4 text-sm italic">Không có thông báo mới</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">Admin Team</p>
                <p className="text-xs text-slate-500">
                  {activeModule === 'Nhân sự' ? 'Quản Lý Nhân Sự' :
                   activeModule === 'Lễ hội' ? 'Thi Công Lễ Hội' : 'Thi Công Cảnh Quan'}
                </p>
              </div>
              <div className={`w-10 h-10 ${
                activeModule === 'Nhân sự' ? 'bg-primary' :
                activeModule === 'Lễ hội' ? 'bg-primary' : 
                activeModule === 'Cảnh quan' ? 'bg-emerald-600' : 'bg-green-600'
              } rounded-full flex items-center justify-center text-white font-bold`}>
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeTab}-${activeModule}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && (
                activeModule === 'Nhân sự' ? <HRDashboard employees={employees} stats={hrStats || {}} /> :
                activeModule === 'Lễ hội' ? <FestivalDashboard /> : 
                activeModule === 'Cảnh quan' ? <LandscapeDashboard /> : <MaintenanceDashboard />
              )}
              {activeTab === 'form' && (
                activeModule === 'Nhân sự' ? (
                  <HRForm 
                    editingEmployee={editingEmployee}
                    onSuccess={() => {
                      addToast(editingEmployee ? 'Cập nhật hồ sơ thành công!' : 'Lưu hồ sơ thành công!', 'success');
                      setActiveTab('reports');
                      setEditingEmployee(null);
                      fetchHRData();
                    }}
                    onError={(err) => addToast(err, 'error')}
                  />
                ) : activeModule === 'Bảo dưỡng' ? (
                  <MaintenanceForm 
                    editingReport={editingReport}
                    onSuccess={() => {
                      addToast(editingReport ? 'Cập nhật báo cáo thành công!' : 'Gửi báo cáo thành công!', 'success');
                      setActiveTab('reports');
                      setEditingReport(null);
                    }}
                    onError={(err) => addToast(err, 'error')}
                  />
                ) : (
                  <LogForm 
                    editingReport={editingReport} 
                    activeModule={activeModule}
                    onSuccess={() => {
                      addToast(editingReport ? 'Cập nhật báo cáo thành công!' : 'Gửi báo cáo thành công!', 'success');
                      setActiveTab('reports');
                      setEditingReport(null);
                    }} 
                    onError={(err) => addToast(err, 'error')}
                  />
                )
              )}
              {activeTab === 'reports' && (
                activeModule === 'Nhân sự' ? (
                  <HRTable 
                    onEdit={handleEditEmployee}
                    onView={setViewingEmployee}
                    onDelete={handleDeleteEmployee}
                  />
                ) : activeModule === 'Bảo dưỡng' ? (
                  <MaintenanceReportTable 
                    onEdit={handleEdit}
                    onDelete={(id) => addToast('Đã xóa báo cáo', 'info')}
                  />
                ) : (
                  <ReportTable onEdit={handleEdit} activeModule={activeModule} />
                )
              )}
              {activeTab === 'settings' && <SettingsView onToast={(msg, type) => addToast(msg, type)} activeModule={activeModule} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* HR Detail Modal */}
        <AnimatePresence>
          {viewingEmployee && (
            <HRDetail 
              employee={viewingEmployee}
              onClose={() => setViewingEmployee(null)}
              onEdit={(emp) => {
                setViewingEmployee(null);
                handleEditEmployee(emp);
              }}
              onDelete={handleDeleteEmployee}
            />
          )}
        </AnimatePresence>

        {/* Toast Container */}
        <div className="fixed bottom-8 right-8 z-[200] flex flex-col gap-3">
          <AnimatePresence>
            {toasts.map(toast => (
              <Toast 
                key={toast.id}
                message={toast.message}
                type={toast.type}
                onClose={() => removeToast(toast.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
