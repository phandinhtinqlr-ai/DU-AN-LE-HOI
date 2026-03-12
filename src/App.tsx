import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Settings as SettingsIcon, 
  Bell, 
  Menu, 
  X, 
  Plus,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import LogForm from './components/LogForm';
import ReportTable from './components/ReportTable';
import SettingsView from './components/Settings';
import { Report } from './types';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'form' | 'reports' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [editingReport, setEditingReport] = useState<Report | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}`;
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_REPORT') {
            const msg = `Báo cáo mới từ ${data.payload.reporter} - ${data.payload.area}`;
            setNotifications(prev => [msg, ...prev].slice(0, 5));
          } else if (data.type === 'UPDATE_REPORT') {
            const msg = `Cập nhật báo cáo từ ${data.payload.reporter} - ${data.payload.area}`;
            setNotifications(prev => [msg, ...prev].slice(0, 5));
          } else if (data.type === 'SETTINGS_UPDATE') {
            const msg = `Cấu hình hệ thống (${data.key}) vừa được thay đổi`;
            setNotifications(prev => [msg, ...prev].slice(0, 5));
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message:", e);
        }
      };
      ws.onerror = (error) => {
        // Silently handle connection errors to avoid uncaught exceptions in console
        console.warn("WebSocket connection issue. Real-time updates may be disabled.");
      };
    } catch (e) {
      console.error("WebSocket initialization failed:", e);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const handleEdit = (report: Report) => {
    setEditingReport(report);
    setActiveTab('form');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'form', label: 'Nhập Nhật Ký', icon: Plus },
    { id: 'reports', label: 'Quản Lý Báo Cáo', icon: FileText },
    { id: 'settings', label: 'Cấu Hình', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-bg-app overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-primary text-white transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shrink-0">
            <span className="font-bold text-primary">SW</span>
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

        <nav className="flex-1 py-6 px-3 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                if (item.id !== 'form') setEditingReport(null);
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                activeTab === item.id 
                  ? 'bg-accent text-primary font-semibold' 
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
          <h2 className="text-xl font-bold text-slate-800 capitalize">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {/* Notification Dropdown (Simple) */}
              <AnimatePresence>
                {notifications.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông báo mới</span>
                      <button onClick={() => setNotifications([])} className="text-xs text-primary hover:underline">Xoá tất cả</button>
                    </div>
                    <div className="space-y-3">
                      {notifications.map((n, i) => (
                        <div key={i} className="text-sm text-slate-600 p-2 bg-slate-50 rounded-lg border-l-4 border-accent">
                          {n}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">Admin Team</p>
                <p className="text-xs text-slate-500">Thi Công Cảnh Quan</p>
              </div>
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'dashboard' && <Dashboard />}
              {activeTab === 'form' && (
                <LogForm 
                  editingReport={editingReport} 
                  onSuccess={() => {
                    setActiveTab('reports');
                    setEditingReport(null);
                  }} 
                />
              )}
              {activeTab === 'reports' && <ReportTable onEdit={handleEdit} />}
              {activeTab === 'settings' && <SettingsView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
