import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Plus, 
  Trash2, 
  Save, 
  RefreshCw,
  CheckCircle2,
  Edit2,
  Activity,
  Sprout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { ToastType } from './Toast';
import { ModuleType } from '../types';

interface SettingsProps {
  onToast: (message: string, type: ToastType) => void;
  activeModule: ModuleType;
}

export default function Settings({ onToast, activeModule }: SettingsProps) {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<string | null>(null);
  const [newOptionValues, setNewOptionValues] = useState<Record<string, string>>({});
  const [editingItem, setEditingItem] = useState<{ group: string, index: number, value: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ group: string, index: number } | null>(null);

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
      onToast('Không thể tải cấu hình', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = (key: string) => {
    const value = newOptionValues[key]?.trim();
    if (!value) return;

    const currentOptions = settings[key] || [];
    if (currentOptions.includes(value)) {
      onToast('Tùy chọn này đã tồn tại', 'info');
      return;
    }

    const updatedValue = [...currentOptions, value];
    updateSetting(key, updatedValue);
    setNewOptionValues(prev => ({ ...prev, [key]: '' }));
  };

  const handleRemoveOption = (key: string, index: number) => {
    const updatedValue = (settings[key] || []).filter((_: any, i: number) => i !== index);
    updateSetting(key, updatedValue);
    setConfirmDelete(null);
  };

  const handleStartEdit = (key: string, index: number, value: string) => {
    setEditingItem({ group: key, index, value });
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    const { group, index, value } = editingItem;
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setEditingItem(null);
      return;
    }

    const updatedValue = [...(settings[group] || [])];
    updatedValue[index] = trimmedValue;
    updateSetting(group, updatedValue);
    setEditingItem(null);
  };

  const updateSetting = async (key: string, value: string[]) => {
    setSaving(key);
    try {
      await api.updateSettings(key, value);
      setSettings((prev: any) => ({ ...prev, [key]: value }));
      onToast('Đã lưu thay đổi', 'success');
      setIsSaved(key);
      setTimeout(() => setIsSaved(null), 2000);
    } catch (error: any) {
      console.error(error);
      onToast(error.message || 'Lỗi khi lưu cấu hình', 'error');
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div className="text-center py-12">Đang tải cấu hình...</div>;

  const festivalGroups = [
    { key: 'festivals', label: 'Danh sách Festival', icon: '🎡' },
    { key: 'areas', label: 'Danh sách Khu vực', icon: '📍' },
    { key: 'stages', label: 'Danh sách Công đoạn', icon: '🏗️' },
    { key: 'products', label: 'Danh sách Loại sản phẩm', icon: '📦' },
    { key: 'productStatuses', label: 'Trạng thái Sản phẩm', icon: '✅' },
    { key: 'workStatuses', label: 'Trạng thái Công việc', icon: '📊' },
  ];

  const landscapeGroups = [
    { key: 'areas', label: 'Danh sách Khu vực', icon: '📍' },
    { key: 'landZones', label: 'Danh sách Vùng đất', icon: '🧭' },
    { key: 'treeSources', label: 'Nguồn cây', icon: '📦' },
    { key: 'treeClassifications', label: 'Phân loại cây', icon: '🌳' },
    { key: 'shifts', label: 'Ca làm việc', icon: '⏰' },
    { key: 'workStatuses', label: 'Trạng thái Công việc', icon: '📊' },
  ];

  const maintenanceGroups = [
    { key: 'areas', label: 'Danh sách Khu vực', icon: '📍' },
    { key: 'landZones', label: 'Danh sách Vùng đất', icon: '🧭' },
    { key: 'maintenanceTypes', label: 'Loại công việc chăm sóc', icon: '🛠️' },
    { key: 'plantCategories', label: 'Phân loại cây', icon: '🌳' },
    { key: 'unitTypes', label: 'Đơn vị tính', icon: '📏' },
    { key: 'plantStatuses', label: 'Tình trạng cây', icon: '📊' },
    { key: 'shifts', label: 'Ca làm việc', icon: '⏰' },
  ];

  const hrGroups = [
    { key: 'staffLevels', label: 'Cấp nhân sự', icon: '🎖️' },
    { key: 'teamGroups', label: 'Đội / Nhóm', icon: '👥' },
  ];

  const settingGroups = activeModule === 'Nhân sự' ? hrGroups : (activeModule === 'Lễ hội' ? festivalGroups : (activeModule === 'Cảnh quan' ? landscapeGroups : maintenanceGroups));
  const themeColor = activeModule === 'Nhân sự' ? 'bg-blue-100 text-blue-600' : (activeModule === 'Lễ hội' ? 'bg-primary/10 text-primary' : (activeModule === 'Cảnh quan' ? 'bg-emerald-100 text-emerald-600' : 'bg-green-100 text-green-600'));
  const accentColor = activeModule === 'Nhân sự' ? 'bg-blue-600' : (activeModule === 'Lễ hội' ? 'bg-primary' : (activeModule === 'Cảnh quan' ? 'bg-emerald-600' : 'bg-green-600'));

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${themeColor} rounded-xl flex items-center justify-center`}>
              <SettingsIcon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800">
                Cấu hình {activeModule === 'Lễ hội' ? 'Lễ hội' : (activeModule === 'Cảnh quan' ? 'Cảnh quan' : 'Bảo dưỡng')}
              </h3>
              <p className="text-sm text-slate-500">Tùy chỉnh các danh mục trong form báo cáo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
              activeModule === 'Lễ hội' ? 'bg-blue-100 text-blue-600' : (activeModule === 'Cảnh quan' ? 'bg-emerald-100 text-emerald-600' : 'bg-green-100 text-green-600')
            }`}>
              {activeModule === 'Bảo dưỡng' ? 'Chăm Sóc – Bảo Dưỡng' : activeModule}
            </div>
            <button 
              onClick={fetchSettings}
              className="p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-full transition-all"
            >
              <RefreshCw size={20} />
            </button>
          </div>
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
                    <span className={`text-[10px] font-bold ${activeModule === 'Lễ hội' ? 'text-primary' : 'text-emerald-600'} animate-pulse flex items-center gap-1`}>
                      <RefreshCw size={12} className="animate-spin" /> ĐANG LƯU...
                    </span>
                  )}
                  {isSaved === group.key && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-[10px] font-bold text-emerald-500 flex items-center gap-1"
                    >
                      <CheckCircle2 size={12} /> ĐÃ LƯU
                    </motion.span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Thêm tùy chọn mới..."
                  value={newOptionValues[group.key] || ''}
                  onChange={e => setNewOptionValues(prev => ({ ...prev, [group.key]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleAddOption(group.key)}
                  className={`flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none transition-all ${
                    activeModule === 'Lễ hội' ? 'focus:ring-primary/20 focus:border-primary' : 'focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                <button 
                  onClick={() => handleAddOption(group.key)}
                  disabled={saving === group.key}
                  className={`p-2 ${accentColor} text-white rounded-xl hover:opacity-90 transition-all shadow-lg disabled:opacity-50`}
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 min-h-[120px]">
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence>
                    {(settings[group.key] || []).map((option: string, index: number) => {
                      const isEditing = editingItem?.group === group.key && editingItem?.index === index;
                      const isConfirmingDelete = confirmDelete?.group === group.key && confirmDelete?.index === index;

                      return (
                        <motion.div
                          key={`${group.key}-${option}-${index}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm transition-all ${
                            isEditing ? (activeModule === 'Lễ hội' ? 'bg-primary/5 border-primary/30 ring-2 ring-primary/10' : 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500/10') : 
                            isConfirmingDelete ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {isEditing ? (
                            <div className="flex items-center gap-2">
                              <input 
                                autoFocus
                                type="text"
                                value={editingItem.value}
                                onChange={e => setEditingItem({ ...editingItem, value: e.target.value })}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveEdit();
                                  if (e.key === 'Escape') setEditingItem(null);
                                }}
                                className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 w-24"
                              />
                              <button onClick={handleSaveEdit} className="text-emerald-500 hover:text-emerald-600">
                                <CheckCircle2 size={14} />
                              </button>
                              <button onClick={() => setEditingItem(null)} className="text-slate-400 hover:text-slate-500">
                                <RefreshCw size={14} />
                              </button>
                            </div>
                          ) : isConfirmingDelete ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-red-600">XOÁ?</span>
                              <button 
                                onClick={() => handleRemoveOption(group.key, index)}
                                className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-lg hover:bg-red-600"
                              >
                                CÓ
                              </button>
                              <button 
                                onClick={() => setConfirmDelete(null)}
                                className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg hover:bg-slate-300"
                              >
                                KO
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="text-sm font-medium text-slate-600">{option}</span>
                              <div className="flex items-center gap-1">
                                <button 
                                  onClick={() => handleStartEdit(group.key, index, option)}
                                  disabled={saving === group.key}
                                  className="p-1 text-slate-300 hover:text-primary transition-colors disabled:opacity-50"
                                >
                                  <Edit2 size={12} />
                                </button>
                                <button 
                                  onClick={() => setConfirmDelete({ group: group.key, index })}
                                  disabled={saving === group.key}
                                  className="p-1 text-slate-300 hover:text-red-500 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </>
                          )}
                        </motion.div>
                      );
                    })}
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
            Việc thay đổi các tùy chọn này sẽ ảnh hưởng trực tiếp đến Form nhập liệu của toàn bộ nhân sự trong module <strong>{activeModule}</strong>. 
            Hãy đảm bảo các tên danh mục là chính xác trước khi lưu. Các báo cáo cũ đã lưu vẫn sẽ giữ nguyên giá trị cũ.
          </p>
        </div>
      </div>
    </div>
  );
}
