import React, { useState, useEffect, useMemo } from 'react';
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
  FileText,
  Clock,
  Users,
  Sprout,
  Compass,
  Info,
  Activity,
  Calculator,
  History,
  ClipboardList,
  Search,
  Check,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Report, WorkType, FestivalType, AreaType, StageType, ProductType, ModuleType, ShiftType, LandZoneType, TreeSourceType, TreeClassificationType } from '../types';
import { api } from '../services/api';

interface LogFormProps {
  editingReport: Report | null;
  activeModule: ModuleType;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const COMMON_TREES = [
  'Cây Bàng Đài Loan',
  'Cây Giáng Hương',
  'Cây Lộc Vừng',
  'Cây Osaka Đỏ',
  'Cây Osaka Vàng',
  'Cây Lim Xẹt',
  'Cây Kèn Hồng',
  'Cây Bằng Lăng',
  'Cây Muồng Hoàng Yến',
  'Cây Phượng Vĩ',
  'Cây Tùng Bách',
  'Cây Nguyệt Quế',
  'Cây Mai Vạn Phúc',
  'Cây Chuỗi Ngọc',
  'Cây Lài Tây',
  'Cây Mắt Nai',
  'Cây Cẩm Tú Mai',
  'Cây Tuyết Sơn Phi Hồng',
  'Cỏ Nhung Nhật',
  'Cỏ Lá Gừng',
  'Cỏ Đậu Phộng'
];

export default function LogForm({ editingReport, activeModule, onSuccess, onError }: LogFormProps) {
  const [options, setOptions] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<Report>>({
    module: activeModule,
    reportDate: new Date().toISOString().split('T')[0],
    reporter: '',
    workType: 'Cải tạo',
    area: 'Mặt Trời',
    stage: 'Khảo sát',
    progress: 0,
    status: 'Đang thực hiện',
    photos: [],
    beforePhotos: [],
    afterPhotos: [],
    
    // Landscape defaults
    shift: 'Sáng',
    landZone: 'Vùng đất 1',
    treeSource: 'Cây mua ngoài',
    treeClassification: 'Cây lớn',
    treeQuantity: 0,
    constructionHours: 0,
    workerCount: 0,
    manDays: 0
  });

  // Update module if activeModule changes and not editing
  useEffect(() => {
    if (!editingReport) {
      setFormData(prev => ({ ...prev, module: activeModule }));
    }
  }, [activeModule, editingReport]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [treeSearch, setTreeSearch] = useState('');
  const [showTreeDropdown, setShowTreeDropdown] = useState(false);

  useEffect(() => {
    if (editingReport?.treeType) {
      setTreeSearch(editingReport.treeType);
    }
  }, [editingReport]);

  const filteredTrees = useMemo(() => 
    COMMON_TREES.filter(t => 
      t.toLowerCase().includes(treeSearch.toLowerCase())
    ), [treeSearch]
  );

  // Auto-calculate Man Days
  useEffect(() => {
    if (formData.module === 'Thi công cây hoa') {
      const hours = formData.constructionHours || 0;
      const workers = formData.workerCount || 0;
      const manDays = Math.round(((hours * workers) / 8) * 10) / 10;
      if (manDays !== formData.manDays) {
        setFormData(prev => ({ ...prev, manDays }));
      }
    }
  }, [formData.constructionHours, formData.workerCount, formData.module, formData.manDays]);

  useEffect(() => {
// ... (fetchOptions logic)
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
        onError('Không thể tải cấu hình form');
      }
    };
    fetchOptions();
  }, [editingReport, onError]);

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

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'photos' | 'beforePhotos' | 'afterPhotos' = 'photos') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [field]: [...((prev as any)[field] || []), reader.result as string]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number, field: 'photos' | 'beforePhotos' | 'afterPhotos' = 'photos') => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev as any)[field]?.filter((_: any, i: number) => i !== index)
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
      onError('Có lỗi xảy ra khi lưu báo cáo');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!options) return <div className="text-center py-12">Đang tải cấu hình form...</div>;

  const isLandscape = formData.module === 'Thi công cây hoa';
  const themeColor = isLandscape ? 'emerald' : 'primary';
  const themeBg = isLandscape ? 'bg-emerald-600' : 'bg-primary';
  const themeText = isLandscape ? 'text-emerald-600' : 'text-primary';
  const themeBorder = isLandscape ? 'focus:border-emerald-500 focus:ring-emerald-500/20' : 'focus:border-primary focus:ring-primary/20';

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8 pb-12">
        {/* Section 1: Thông tin chung */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${isLandscape ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'} rounded-lg flex items-center justify-center`}>
                <FileText size={18} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{isLandscape ? '1. PHẦN 1 — THÔNG TIN BÁO CÁO' : 'Thông tin báo cáo'}</h3>
            </div>
            {lastSaved && !editingReport && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <div className={`w-1.5 h-1.5 ${isLandscape ? 'bg-emerald-500' : 'bg-emerald-500'} rounded-full animate-pulse`}></div>
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
                className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
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
                className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
              />
            </div>
            
            {isLandscape ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Users size={14} /> Đội thi công
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nhập tên đội thi công"
                    value={formData.constructionTeam || ''}
                    onChange={e => setFormData({...formData, constructionTeam: e.target.value})}
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Clock size={14} /> Ca làm việc
                  </label>
                  <select 
                    value={formData.shift}
                    onChange={e => setFormData({...formData, shift: e.target.value as ShiftType})}
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all appearance-none ${themeBorder}`}
                  >
                    {(options.shifts || ['Sáng', 'Chiều', 'Cả ngày']).map((s: string) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                  <Briefcase size={14} /> Loại công việc
                </label>
                <select 
                  value={formData.workType}
                  onChange={e => setFormData({...formData, workType: e.target.value as WorkType})}
                  className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all appearance-none ${themeBorder}`}
                >
                  <option value="Cải tạo">Cải tạo</option>
                  <option value="Festival">Festival</option>
                </select>
              </div>
            )}
          </div>
        </section>

        {/* Section 2: Chi tiết */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 ${isLandscape ? 'bg-emerald-100 text-emerald-600' : 'bg-accent/10 text-accent'} rounded-lg flex items-center justify-center`}>
              {isLandscape ? <MapPin size={18} /> : <Layers size={18} />}
            </div>
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{isLandscape ? '3. THÔNG TIN VỊ TRÍ THI CÔNG' : 'Chi tiết thi công'}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLandscape ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <MapPin size={14} /> Vị trí thi công
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Nhập vị trí cụ thể"
                    value={formData.location || ''}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <MapPin size={14} /> Khu vực
                  </label>
                  <select 
                    value={formData.area}
                    onChange={e => setFormData({...formData, area: e.target.value as AreaType})}
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                  >
                    {(options.areas || []).map((a: string) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                    <Compass size={14} /> 4. PHÂN VÙNG 4 VÙNG ĐẤT
                  </label>
                  <select 
                    value={formData.landZone}
                    onChange={e => setFormData({...formData, landZone: e.target.value as LandZoneType})}
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                  >
                    {(options.landZones || ['Vùng đất 1', 'Vùng đất 2', 'Vùng đất 3', 'Vùng đất 4']).map((z: string) => (
                      <option key={z} value={z}>{z}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                {formData.workType === 'Festival' && (
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Festival</label>
                    <select 
                      required
                      value={formData.festival}
                      onChange={e => setFormData({...formData, festival: e.target.value as FestivalType})}
                      className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
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
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
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
                    className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                  >
                    {(options.stages || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          {isLandscape && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-8 pt-6 border-t border-slate-100"
            >
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Sprout size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">5. THÔNG TIN CÂY THAY THẾ</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Sprout size={14} /> Loại cây thay thế
                    </label>
                    <div className="relative">
                      <input 
                        type="text" 
                        required
                        placeholder="Tìm hoặc nhập tên loại cây..."
                        value={treeSearch}
                        onChange={e => {
                          setTreeSearch(e.target.value);
                          setFormData({...formData, treeType: e.target.value});
                          setShowTreeDropdown(true);
                        }}
                        onFocus={() => setShowTreeDropdown(true)}
                        className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <Search size={16} />
                      </div>
                    </div>
                    
                    {showTreeDropdown && treeSearch && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                        {filteredTrees.length > 0 ? (
                          filteredTrees.map((tree) => (
                            <button
                              key={tree}
                              type="button"
                              className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center justify-between group"
                              onClick={() => {
                                setTreeSearch(tree);
                                setFormData({...formData, treeType: tree});
                                setShowTreeDropdown(false);
                              }}
                            >
                              <span className="text-slate-700">{tree}</span>
                              <Check size={14} className="text-emerald-500 opacity-0 group-hover:opacity-100" />
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-slate-400 italic">
                            Không tìm thấy, nhấn Enter để dùng tên này
                          </div>
                        )}
                      </div>
                    )}
                    {showTreeDropdown && (
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setShowTreeDropdown(false)}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Box size={14} /> Nguồn cây
                    </label>
                    <select 
                      value={formData.treeSource}
                      onChange={e => setFormData({...formData, treeSource: e.target.value as TreeSourceType})}
                      className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                    >
                      {(options.treeSources || ['Cây mua ngoài', 'Sản xuất', 'Hasfarm']).map((s: string) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Layers size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">6. PHÂN LOẠI CÂY</h3>
                </div>
                <select 
                  value={formData.treeClassification}
                  onChange={e => setFormData({...formData, treeClassification: e.target.value as TreeClassificationType})}
                  className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                >
                  {(options.treeClassifications || ['Cây lớn', 'Cây bụi', 'Cây hoa thảm']).map((c: string) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Activity size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">7. KHỐI LƯỢNG THI CÔNG</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Hash size={14} /> Số lượng cây
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={formData.treeQuantity || ''}
                      onChange={e => setFormData({...formData, treeQuantity: parseInt(e.target.value)})}
                      className={`w-full p-3 bg-white border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Clock size={14} /> Số giờ thi công
                    </label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.5"
                      required
                      value={formData.constructionHours || ''}
                      onChange={e => setFormData({...formData, constructionHours: parseFloat(e.target.value)})}
                      className={`w-full p-3 bg-white border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <Users size={14} /> Số người thi công
                    </label>
                    <input 
                      type="number" 
                      min="1"
                      required
                      value={formData.workerCount || ''}
                      onChange={e => setFormData({...formData, workerCount: parseInt(e.target.value)})}
                      className={`w-full p-3 bg-white border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Activity size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">8. TỰ ĐỘNG TÍNH SỐ CÔNG</h3>
                </div>
                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-emerald-800 uppercase tracking-wider">Số công (8 giờ/công)</span>
                    <span className="text-2xl font-black text-emerald-600">{formData.manDays} công</span>
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-2 italic">* Công thức: (Số giờ × Số người) / 8</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <Info size={18} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">10. GHI CHÚ HIỆN TRƯỜNG</h3>
                </div>
                <textarea 
                  rows={4}
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Nhập ghi chú: tình trạng cây, khó khăn thi công, vật tư thiếu..."
                  className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all resize-none ${themeBorder}`}
                />
              </div>
            </motion.div>
          )}

          {!isLandscape && (
            <>
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
                      className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
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
                      className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600 flex items-center gap-2">
                      <CheckCircle size={14} /> Trạng thái sản phẩm
                    </label>
                    <select 
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                      className={`w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${themeBorder}`}
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
                      className={`w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all resize-none ${themeBorder}`}
                    />
                  </div>
                </motion.div>
              )}
            </>
          )}
        </section>

        {/* Section 3: Hình ảnh */}
        <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-8 h-8 ${isLandscape ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-100 text-emerald-600'} rounded-lg flex items-center justify-center`}>
              <ImageIcon size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">{isLandscape ? '11. ẢNH HIỆN TRƯỜNG' : 'Ảnh hiện trường'}</h3>
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
            <label className={`aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all text-slate-400 ${isLandscape ? 'hover:border-emerald-500 hover:text-emerald-600' : 'hover:border-primary hover:text-primary'}`}>
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
            className={`flex items-center gap-2 px-8 py-4 text-white rounded-2xl font-bold transition-all shadow-xl disabled:opacity-50 ${isLandscape ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700' : 'bg-primary shadow-primary/20 hover:bg-primary/90'}`}
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
