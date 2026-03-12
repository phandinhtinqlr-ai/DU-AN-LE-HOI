import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  User, 
  Briefcase, 
  MapPin, 
  Layers, 
  Box, 
  Hash, 
  CheckCircle, 
  Image as ImageIcon,
  Upload,
  X,
  Save,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import { Report, WorkType, FestivalType, AreaType, StageType, ProductType, ProductStatus, WorkStatus } from '../types';
import { api } from '../services/api';

interface LogFormProps {
  editingReport: Report | null;
  onSuccess: () => void;
}

export default function LogForm({ editingReport, onSuccess }: LogFormProps) {
  const [options, setOptions] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<Report>>({
    reportDate: new Date().toISOString().split('T')[0],
    reporter: '',
    workType: 'Cải tạo',
    area: 'Mặt Trời',
    stage: 'Khảo sát',
    progress: 0,
    status: 'Đang thực hiện',
    photos: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const data = await api.getSettings();
        setOptions(data);
        
        // Set default area if not editing
        if (!editingReport && data.areas?.length > 0) {
          setFormData(prev => ({ ...prev, area: data.areas[0] }));
        }
        if (!editingReport && data.stages?.length > 0) {
          setFormData(prev => ({ ...prev, stage: data.stages[0] }));
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchOptions();
  }, [editingReport]);

  useEffect(() => {
    if (editingReport) {
      setFormData(editingReport);
    } else {
      const saved = localStorage.getItem('construction_log_draft');
      if (saved) {
        try {
          setFormData(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load draft", e);
        }
      }
    }
  }, [editingReport]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!editingReport) {
      const timer = setTimeout(() => {
        localStorage.setItem('construction_log_draft', JSON.stringify(formData));
        setLastSaved(new Date().toLocaleTimeString());
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData, editingReport]);

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
    setIsSubmitting(true);
    try {
      if (editingReport?.id) {
        await api.updateReport(editingReport.id, formData as Report);
      } else {
        await api.createReport(formData as Report);
        localStorage.removeItem('construction_log_draft');
      }
      onSuccess();
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra khi lưu báo cáo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!options) return <div className="text-center py-12">Đang tải cấu hình form...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        {/* Section 1: Thông tin chung */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                <FileText size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Thông tin báo cáo</h3>
            </div>
            {lastSaved && !editingReport && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Đã lưu nháp: {lastSaved}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Calendar size={14} /> Ngày báo cáo
              </label>
              <input 
                type="date" 
                required
                value={formData.reportDate}
                onChange={e => setFormData({...formData, reportDate: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <User size={14} /> Người báo cáo
              </label>
              <input 
                type="text" 
                required
                placeholder="Nhập tên của bạn"
                value={formData.reporter}
                onChange={e => setFormData({...formData, reporter: e.target.value})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Briefcase size={14} /> Loại công việc
              </label>
              <select 
                value={formData.workType}
                onChange={e => setFormData({...formData, workType: e.target.value as WorkType})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"
              >
                <option value="Cải tạo">Cải tạo</option>
                <option value="Festival">Festival</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 2: Chi tiết */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-accent/10 text-accent rounded-lg flex items-center justify-center">
              <Layers size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Chi tiết thi công</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.workType === 'Festival' && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Festival</label>
                <select 
                  required
                  value={formData.festival}
                  onChange={e => setFormData({...formData, festival: e.target.value as FestivalType})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option value="">Chọn Festival</option>
                  {(options.festivals || []).map((f: string) => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <MapPin size={14} /> Khu vực
              </label>
              <select 
                value={formData.area}
                onChange={e => setFormData({...formData, area: e.target.value as AreaType})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              >
                {(options.areas || []).map((a: string) => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                <Layers size={14} /> Công đoạn
              </label>
              <select 
                value={formData.stage}
                onChange={e => setFormData({...formData, stage: e.target.value as StageType})}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              >
                {(options.stages || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Logic nhánh: Gia công sản phẩm */}
          {formData.stage === 'Gia công sản phẩm' ? (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100"
            >
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <Box size={14} /> Loại sản phẩm
                </label>
                <select 
                  value={formData.productType}
                  onChange={e => setFormData({...formData, productType: e.target.value as ProductType})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  <option value="">Chọn loại sản phẩm</option>
                  {(options.products || []).map((p: string) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <Hash size={14} /> Số lượng
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.quantity || ''}
                  onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <CheckCircle size={14} /> Trạng thái sản phẩm
                </label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                >
                  {(options.productStatuses || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-6 pt-6 border-t border-slate-100"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-600">% Tiến độ</label>
                  <span className="text-primary font-bold">{formData.progress}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={formData.progress}
                  onChange={e => setFormData({...formData, progress: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Trạng thái công việc</label>
                <div className="flex flex-wrap gap-3">
                  {(options.workStatuses || []).map((s: string) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({...formData, status: s})}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.status === s 
                          ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600">Ghi chú hiện trường</label>
                <textarea 
                  rows={3}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Nhập ghi chú chi tiết..."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                />
              </div>
            </motion.div>
          )}
        </section>

        {/* Section 3: Hình ảnh */}
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
            <label className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 hover:border-primary transition-all text-slate-400 hover:text-primary">
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
            className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
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
