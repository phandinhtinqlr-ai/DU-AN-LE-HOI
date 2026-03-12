import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

export default function Settings() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSettings();
      setSettings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = (key: string) => {
    const newOption = prompt('Nhập tên tùy chọn mới:');
    if (newOption && !settings[key].includes(newOption)) {
      const updatedValue = [...settings[key], newOption];
      updateSetting(key, updatedValue);
    }
  };

  const handleRemoveOption = (key: string, index: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá tùy chọn này?')) {
      const updatedValue = settings[key].filter((_: any, i: number) => i !== index);
      updateSetting(key, updatedValue);
    }
  };

  const updateSetting = async (key: string, value: string[]) => {
    setSaving(key);
    try {
      await api.updateSettings(key, value);
      setSettings({ ...settings, [key]: value });
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setSaving(null), 1000);
    }
  };

  if (loading) return <div className="text-center py-12">Đang tải cấu hình...</div>;

  const settingGroups = [
    { key: 'festivals', label: 'Danh sách Festival', icon: '🎡' },
    { key: 'areas', label: 'Danh sách Khu vực', icon: '📍' },
    { key: 'stages', label: 'Danh sách Công đoạn', icon: '🏗️' },
    { key: 'products', label: 'Danh sách Loại sản phẩm', icon: '📦' },
    { key: 'productStatuses', label: 'Trạng thái Sản phẩm', icon: '✅' },
    { key: 'workStatuses', label: 'Trạng thái Công việc', icon: '📊' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
              <SettingsIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">Cấu hình hệ thống</h3>
              <p className="text-sm text-slate-500">Tùy chỉnh các danh mục trong form báo cáo</p>
            </div>
          </div>
          <button 
            onClick={fetchSettings}
            className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-full transition-all"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {settingGroups.map((group) => (
            <div key={group.key} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{group.icon}</span>
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">{group.label}</label>
                </div>
                <div className="flex items-center gap-2">
                  {saving === group.key && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} /> ĐÃ LƯU
                    </motion.span>
                  )}
                  <button 
                    onClick={() => handleAddOption(group.key)}
                    className="p-1.5 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[120px]">
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {settings[group.key].map((option: string, index: number) => (
                      <motion.div
                        key={option}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all"
                      >
                        <span className="text-sm font-medium text-slate-600">{option}</span>
                        <button 
                          onClick={() => handleRemoveOption(group.key, index)}
                          className="text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-start gap-4">
        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
          <span className="text-xl">💡</span>
        </div>
        <div>
          <h4 className="font-bold text-amber-900 mb-1">Lưu ý quan trọng</h4>
          <p className="text-sm text-amber-800 leading-relaxed">
            Việc thay đổi các tùy chọn này sẽ ảnh hưởng trực tiếp đến Form nhập liệu của toàn bộ nhân sự. 
            Hãy đảm bảo các tên danh mục là chính xác trước khi lưu. Các báo cáo cũ đã lưu vẫn sẽ giữ nguyên giá trị cũ.
          </p>
        </div>
      </div>
    </div>
  );
}
