import React from 'react';
import { 
  X, 
  User, 
  IdCard, 
  Calendar, 
  Briefcase, 
  MapPin, 
  Clock, 
  Shield, 
  Users,
  Edit2,
  Trash2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Employee } from '../types';
import { format } from 'date-fns';

interface HRDetailProps {
  employee: Employee;
  onClose: () => void;
  onEdit: (employee: Employee) => void;
  onDelete: (id: number) => void;
}

export default function HRDetail({ employee, onClose, onEdit, onDelete }: HRDetailProps) {
  const calculateTenure = (joinDate: string) => {
    const start = new Date(joinDate);
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
    
    return tenureStr.trim() || 'Mới vào làm';
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl bg-bg-app rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header with Background Pattern */}
        <div className="h-32 bg-blue-600 relative shrink-0">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Profile Info Overlay */}
        <div className="px-8 pb-8 -mt-16 relative flex-1 overflow-y-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column: Image & Basic Info */}
            <div className="w-full md:w-64 shrink-0 space-y-6">
              <div className="aspect-[3/4] bg-white rounded-[32px] shadow-xl border-4 border-white overflow-hidden">
                {employee.profileImageUrl ? (
                  <img src={employee.profileImageUrl} alt={employee.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <User size={80} />
                  </div>
                )}
              </div>
              
              <div className="bg-white p-6 rounded-[32px] shadow-sm border border-blue-100 space-y-4">
                <div className="text-center">
                  <h3 className="text-xl font-black text-slate-800">{employee.fullName}</h3>
                  <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">{employee.employeeCode}</p>
                </div>
                <div className="flex justify-center">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    employee.workStatus === 'Đang làm việc' ? 'bg-emerald-100 text-emerald-600' :
                    employee.workStatus === 'Tạm nghỉ' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {employee.workStatus}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => onEdit(employee)}
                  className="flex-1 py-4 bg-white text-indigo-600 rounded-2xl font-bold shadow-sm border border-indigo-100 hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                >
                  <Edit2 size={18} />
                  Sửa
                </button>
                <button 
                  onClick={() => employee.id && onDelete(employee.id)}
                  className="flex-1 py-4 bg-white text-red-600 rounded-2xl font-bold shadow-sm border border-red-100 hover:bg-red-50 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Xóa
                </button>
              </div>
            </div>

            {/* Right Column: Detailed Info */}
            <div className="flex-1 space-y-8 py-4">
              {/* Info Groups */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Identification */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                    <IdCard size={16} />
                    <span>Định danh</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Số CCCD</p>
                      <p className="text-sm font-bold text-slate-700">{employee.citizenId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày sinh</p>
                      <p className="text-sm font-bold text-slate-700">{format(new Date(employee.dateOfBirth), 'dd/MM/yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giới tính</p>
                      <p className="text-sm font-bold text-slate-700">{employee.gender}</p>
                    </div>
                  </div>
                </div>

                {/* Employment */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                    <Briefcase size={16} />
                    <span>Công việc</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phân loại</p>
                      <p className="text-sm font-bold text-slate-700">{employee.employeeType}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đội / Nhóm</p>
                      <p className="text-sm font-bold text-slate-700">{employee.teamGroup}</p>
                    </div>
                    {employee.staffLevel && (
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cấp nhân sự</p>
                        <p className="text-sm font-bold text-slate-700">{employee.staffLevel}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tenure & Dates */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                    <Clock size={16} />
                    <span>Thâm niên</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày vào làm</p>
                      <p className="text-sm font-bold text-slate-700">{format(new Date(employee.joinDate), 'dd/MM/yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thời gian công tác</p>
                      <p className="text-lg font-black text-blue-600">{calculateTenure(employee.joinDate)}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="bg-white p-6 rounded-[32px] shadow-sm border border-blue-100 space-y-4">
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
                    <MapPin size={16} />
                    <span>Liên hệ</span>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Địa chỉ thường trú</p>
                    <p className="text-sm font-medium text-slate-600 leading-relaxed">{employee.address}</p>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex flex-wrap gap-8">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày tạo hồ sơ</p>
                  <p className="text-xs font-bold text-slate-500">{employee.createdAt ? format(new Date(employee.createdAt), 'HH:mm dd/MM/yyyy') : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cập nhật gần nhất</p>
                  <p className="text-xs font-bold text-slate-500">{employee.updatedAt ? format(new Date(employee.updatedAt), 'HH:mm dd/MM/yyyy') : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
