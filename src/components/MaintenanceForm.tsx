import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Users, 
  Clock, 
  MapPin, 
  Layers, 
  Droplets, 
  Sprout, 
  Activity, 
  Info, 
  ImageIcon, 
  Upload, 
  X, 
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Report, ModuleType, ShiftType, LandZoneType, MaintenanceType, PlantCategoryType, UnitType, PlantStatusType } from '../types';
import { api } from '../services/api';

interface MaintenanceFormProps {
  editingReport: Report | null;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function MaintenanceForm({ editingReport, onSuccess, onError }: MaintenanceFormProps) {
  const [options, setOptions] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<Report>>({
    module: 'Bảo dưỡng',
    reportDate: new Date().toISOString().split('T')[0],
    reporter: '',
    constructionTeam: '',
    shift: 'Sáng',
    area: 'Mặt Trời',
    landZone: 'Vùng đất 1',
    maintenanceType: 'Tưới nước',
    plantCategory: 'Cây lớn',
    unitType: 'Cây',
    quantity: 0,
    constructionHours: 0,
    workerCount: 0,
    manDays: 0,
    plantStatus: 'Tốt',
    notes: '',
    photos: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculate Man Days
  useEffect(() => {
    const hours = formData.constructionHours || 0;
    const workers = formData.workerCount || 0;
    const manDays = Math.round(((hours * workers) / 8) * 10) / 10;
    if (manDays !== formData.manDays) {
      setFormData(prev => ({ ...prev, manDays }));
    }
  }, [formData.constructionHours, formData.workerCount, formData.manDays]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await api.getSettings();
        setOptions(data);
      } catch (error) {
        console.error(error);
        onError('Không thể tải cấu hình form');
      }
    };
    fetchOptions();
  }, [onError]);

  useEffect(() => {
    if (editingReport) {
      setFormData(editingReport);
    }
  }, [editingReport]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photos: [...(prev.photos || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reporter || !formData.constructionTeam) {
      onError('Vui lòng nhập đầy đủ Người báo cáo và Đội chăm sóc');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingReport?.id) {
        await api.updateReport(editingReport.id, formData as Report);
      } else {
        await api.createReport(formData as Report);
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      onError('Có lỗi xảy ra khi lưu báo cáo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!options) return <div className="text-center py-12">Đang tải cấu hình form...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        {/* PHẦN 1 — THÔNG TIN BÁO CÁO */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <Calendar size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Thông tin báo cáo</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Calendar size={14} /> Ngày báo cáo
              </label>
              <input 
                type="date" 
                value={formData.reportDate}
                onChange={e => setFormData({...formData, reportDate: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <User size={14} /> Người báo cáo
              </label>
              <input 
                type="text" 
                value={formData.reporter}
                onChange={e => setFormData({...formData, reporter: e.target.value})}
                placeholder="Nhập tên người báo cáo"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Users size={14} /> Đội chăm sóc
              </label>
              <input 
                type="text" 
                value={formData.constructionTeam}
                onChange={e => setFormData({...formData, constructionTeam: e.target.value})}
                placeholder="Nhập tên đội chăm sóc"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Clock size={14} /> Ca làm việc
              </label>
              <select 
                value={formData.shift}
                onChange={e => setFormData({...formData, shift: e.target.value as ShiftType})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
              >
                {(options.shifts || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* PHẦN 2 & 3 — KHU VỰC & PHÂN VÙNG */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <MapPin size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Khu vực & Phân vùng</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <MapPin size={14} /> Khu vực thực hiện
              </label>
              <select 
                value={formData.area}
                onChange={e => setFormData({...formData, area: e.target.value as any})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
              >
                {(options.areas || []).map((a: string) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Layers size={14} /> Phân vùng 4 vùng đất
              </label>
              <select 
                value={formData.landZone}
                onChange={e => setFormData({...formData, landZone: e.target.value as LandZoneType})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
              >
                {(options.landZones || []).map((z: string) => <option key={z} value={z}>{z}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* PHẦN 4 & 5 — LOẠI CÔNG VIỆC & PHÂN LOẠI CÂY */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <Droplets size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Nội dung công việc</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Droplets size={14} /> Loại công việc chăm sóc
              </label>
              <select 
                value={formData.maintenanceType}
                onChange={e => setFormData({...formData, maintenanceType: e.target.value as MaintenanceType})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
              >
                {(options.maintenanceTypes || []).map((t: string) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <AnimatePresence>
              {formData.maintenanceType === 'Khác' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-bold text-slate-600">Nội dung công việc khác</label>
                  <input 
                    type="text" 
                    value={formData.customMaintenanceType || ''}
                    onChange={e => setFormData({...formData, customMaintenanceType: e.target.value})}
                    placeholder="Nhập nội dung công việc..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Sprout size={14} /> Phân loại cây / hạng mục
              </label>
              <select 
                value={formData.plantCategory}
                onChange={e => setFormData({...formData, plantCategory: e.target.value as PlantCategoryType})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
              >
                {(options.plantCategories || []).map((c: string) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* PHẦN 6 & 7 — KHỐI LƯỢNG & NHÂN CÔNG */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <Activity size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Khối lượng & Nhân công</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Activity size={14} /> Khối lượng thực hiện
              </label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={formData.quantity || ''}
                  onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                  placeholder="Số lượng"
                  className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                />
                <select 
                  value={formData.unitType}
                  onChange={e => setFormData({...formData, unitType: e.target.value as UnitType})}
                  className="w-32 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                >
                  {(options.unitTypes || []).map((u: string) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <AnimatePresence>
              {formData.unitType === 'Khác' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-bold text-slate-600">Đơn vị tính khác</label>
                  <input 
                    type="text" 
                    value={formData.customUnitType || ''}
                    onChange={e => setFormData({...formData, customUnitType: e.target.value})}
                    placeholder="Nhập đơn vị..."
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Clock size={14} /> Số giờ làm việc
              </label>
              <input 
                type="number" 
                value={formData.constructionHours || ''}
                onChange={e => setFormData({...formData, constructionHours: parseFloat(e.target.value)})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Users size={14} /> Số người thực hiện
              </label>
              <input 
                type="number" 
                value={formData.workerCount || ''}
                onChange={e => setFormData({...formData, workerCount: parseInt(e.target.value)})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Activity size={14} /> Số công (Tự động)
              </label>
              <input 
                type="number" 
                value={formData.manDays}
                readOnly
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl outline-none text-slate-500 font-bold"
              />
            </div>
          </div>
        </section>

        {/* PHẦN 8 & 9 — TÌNH TRẠNG & GHI CHÚ */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <Info size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Tình trạng & Ghi chú</h3>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <CheckCircle size={14} /> Tình trạng cây / cảnh quan
              </label>
              <div className="flex flex-wrap gap-3">
                {(options.plantStatuses || []).map((s: string) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({...formData, plantStatus: s as PlantStatusType})}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      formData.plantStatus === s 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <AlertCircle size={14} /> Ghi chú hiện trường
              </label>
              <textarea 
                rows={4}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Nhập ghi chú chi tiết (khu vực cây yếu, sâu bệnh, đề xuất...)"
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all resize-none"
              />
            </div>
          </div>
        </section>

        {/* PHẦN 10 — ẢNH HIỆN TRƯỜNG */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
              <ImageIcon size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Ảnh hiện trường</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {formData.photos?.map((photo, index) => (
              <div key={index} className="relative aspect-square rounded-2xl overflow-hidden group">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all text-slate-400 hover:border-emerald-500 hover:text-emerald-600">
              <Upload size={24} />
              <span className="text-xs font-bold uppercase tracking-wider">Tải ảnh lên</span>
              <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </section>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold transition-all shadow-xl shadow-emerald-200 hover:bg-emerald-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {editingReport ? 'Cập nhật báo cáo' : 'Gửi báo cáo ngay'}
          </button>
        </div>
      </form>
    </div>
  );
}
