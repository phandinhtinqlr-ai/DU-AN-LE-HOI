import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  IdCard, 
  Calendar, 
  Briefcase, 
  MapPin, 
  Camera, 
  Save, 
  X, 
  AlertCircle,
  ChevronRight,
  Info,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee, EmployeeType, GenderType, WorkStatusType, TeamGroupType } from '../types';
import { api } from '../services/api';

interface HRFormProps {
  editingEmployee?: Employee | null;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function HRForm({ editingEmployee, onSuccess, onError }: HRFormProps) {
  const [formData, setFormData] = useState<Partial<Employee>>({
    employeeCode: '',
    citizenId: '',
    fullName: '',
    employeeType: 'Nhân viên',
    gender: 'Nam',
    dateOfBirth: '',
    joinDate: new Date().toISOString().split('T')[0],
    workStatus: 'Đang làm việc',
    staffLevel: 'Nhân viên',
    teamGroup: 'Thi công',
    address: '',
    profileImageUrl: ''
  });

  const [options, setOptions] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [tenure, setTenure] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const settings = await api.getSettings();
        setOptions(settings);
      } catch (error) {
        console.error(error);
      }
    };
    fetchOptions();
  }, []);

  useEffect(() => {
    if (editingEmployee) {
      setFormData(editingEmployee);
    }
  }, [editingEmployee]);

  // Calculate Tenure
  useEffect(() => {
    if (formData.joinDate) {
      const start = new Date(formData.joinDate);
      const now = new Date();
      
      let years = now.getFullYear() - start.getFullYear();
      let months = now.getMonth() - start.getMonth();
      let days = now.getDate() - start.getDate();

      if (days < 0) {
        months--;
        const lastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += lastMonth.getDate();
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      let tenureStr = '';
      if (years > 0) tenureStr += `${years} năm `;
      if (months > 0) tenureStr += `${months} tháng `;
      if (days > 0 && years === 0 && months === 0) tenureStr += `${days} ngày`;
      if (!tenureStr) tenureStr = 'Mới vào làm';
      
      setTenure(tenureStr.trim());
    }
  }, [formData.joinDate]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeCode || !formData.citizenId || !formData.fullName) {
      onError('Vui lòng nhập đầy đủ các trường bắt buộc');
      return;
    }

    setLoading(true);
    try {
      if (editingEmployee?.id) {
        await api.updateEmployee(editingEmployee.id, formData as Employee);
      } else {
        await api.createEmployee(formData as Employee);
      }
      onSuccess();
    } catch (error: any) {
      onError(error.message || 'Lỗi khi lưu hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header Card */}
      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <User size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">
              {editingEmployee ? 'Chỉnh sửa hồ sơ' : 'Thêm hồ sơ nhân sự mới'}
            </h2>
            <p className="text-slate-500 text-sm">Vui lòng điền đầy đủ thông tin nhân sự bên dưới</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Section 1: Identification */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
              <IdCard size={18} />
              <span>Thông tin định danh</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Mã nhân sự *</label>
                <input 
                  type="text" 
                  value={formData.employeeCode}
                  onChange={e => setFormData({...formData, employeeCode: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="Nhập mã nhân sự..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">CCCD *</label>
                <input 
                  type="text" 
                  value={formData.citizenId}
                  onChange={e => setFormData({...formData, citizenId: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="Nhập số CCCD..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Họ và tên *</label>
                <input 
                  type="text" 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                  placeholder="Nhập họ và tên..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Phân loại</label>
                  <select 
                    value={formData.employeeType}
                    onChange={e => setFormData({...formData, employeeType: e.target.value as EmployeeType})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                  >
                    <option value="Nhân viên">Nhân viên</option>
                    <option value="Công nhật">Công nhật</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Giới tính</label>
                  <select 
                    value={formData.gender}
                    onChange={e => setFormData({...formData, gender: e.target.value as GenderType})}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ngày sinh</label>
                <input 
                  type="date" 
                  value={formData.dateOfBirth}
                  onChange={e => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Work Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
              <Briefcase size={18} />
              <span>Thông tin công việc</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ngày vào làm</label>
                <input 
                  type="date" 
                  value={formData.joinDate}
                  onChange={e => setFormData({...formData, joinDate: e.target.value})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tình trạng</label>
                <select 
                  value={formData.workStatus}
                  onChange={e => setFormData({...formData, workStatus: e.target.value as WorkStatusType})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                >
                  <option value="Đang làm việc">Đang làm việc</option>
                  <option value="Tạm nghỉ">Tạm nghỉ</option>
                  <option value="Nghỉ việc">Nghỉ việc</option>
                </select>
              </div>

              <AnimatePresence mode="wait">
                {formData.employeeType === 'Nhân viên' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Cấp nhân sự</label>
                    <select 
                      value={formData.staffLevel}
                      onChange={e => setFormData({...formData, staffLevel: e.target.value})}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                    >
                      {(options?.staffLevels || []).map((level: string) => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Đội / Nhóm</label>
                <select 
                  value={formData.teamGroup}
                  onChange={e => setFormData({...formData, teamGroup: e.target.value as TeamGroupType})}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all font-medium"
                >
                  {(options?.teamGroups || []).map((group: string) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Thâm niên (Tự tính)</label>
                <div className="w-full px-5 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-bold flex items-center gap-2">
                  <Clock size={16} />
                  {tenure}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Contact & Photo */}
        <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
              <MapPin size={18} />
              <span>Thông tin liên hệ</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Địa chỉ</label>
              <textarea 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                rows={4}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium resize-none"
                placeholder="Nhập địa chỉ thường trú..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-wider">
              <Camera size={18} />
              <span>Ảnh nhân sự</span>
            </div>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-[3/4] bg-slate-50 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all group relative overflow-hidden"
            >
              {formData.profileImageUrl ? (
                <>
                  <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="text-white" size={32} />
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="text-slate-400 group-hover:text-blue-500" size={32} />
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tải ảnh lên</p>
                </>
              )}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handlePhotoUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => onSuccess()}
          className="px-8 py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-4 bg-blue-600 text-white rounded-[24px] font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center gap-3 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {editingEmployee ? 'Cập nhật hồ sơ' : 'Lưu hồ sơ nhân sự'}
        </button>
      </div>
    </form>
  );
}
