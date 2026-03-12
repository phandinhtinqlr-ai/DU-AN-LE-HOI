import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Edit2, 
  Trash2, 
  Eye, 
  User, 
  MoreVertical,
  Download,
  Calendar,
  Briefcase,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Employee, EmployeeType, GenderType, WorkStatusType, TeamGroupType } from '../types';
import { api } from '../services/api';
import { format } from 'date-fns';

interface HRTableProps {
  onEdit: (employee: Employee) => void;
  onView: (employee: Employee) => void;
  onDelete: (id: number) => void;
}

export default function HRTable({ onEdit, onView, onDelete }: HRTableProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    gender: '',
    status: '',
    team: ''
  });
  const [options, setOptions] = useState<any>(null);

  const fetchEmployees = async () => {
    try {
      const data = await api.getEmployees();
      setEmployees(data);
      const settings = await api.getSettings();
      setOptions(settings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const calculateTenure = (joinDate: string) => {
    const start = new Date(joinDate);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
    
    if (months >= 12) {
      const years = Math.floor(months / 12);
      const remainingMonths = months % 12;
      return `${years} năm${remainingMonths > 0 ? ` ${remainingMonths} tháng` : ''}`;
    }
    return `${months} tháng`;
  };

  const filteredEmployees = employees.filter(e => {
    const matchesSearch = e.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.employeeCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         e.citizenId.includes(searchTerm);
    const matchesType = !filters.type || e.employeeType === filters.type;
    const matchesGender = !filters.gender || e.gender === filters.gender;
    const matchesStatus = !filters.status || e.workStatus === filters.status;
    const matchesTeam = !filters.team || e.teamGroup === filters.team;

    return matchesSearch && matchesType && matchesGender && matchesStatus && matchesTeam;
  });

  if (loading) return <div className="text-center py-12">Đang tải danh sách nhân sự...</div>;

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo tên, mã nhân sự, CCCD..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-600 font-bold hover:bg-slate-100 transition-all flex items-center gap-2">
              <Download size={18} />
              Xuất Excel
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select 
            value={filters.type}
            onChange={e => setFilters({...filters, type: e.target.value})}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
          >
            <option value="">Tất cả phân loại</option>
            <option value="Nhân viên">Nhân viên</option>
            <option value="Công nhật">Công nhật</option>
          </select>
          <select 
            value={filters.gender}
            onChange={e => setFilters({...filters, gender: e.target.value})}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
          >
            <option value="">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
            <option value="Khác">Khác</option>
          </select>
          <select 
            value={filters.status}
            onChange={e => setFilters({...filters, status: e.target.value})}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
          >
            <option value="">Tất cả tình trạng</option>
            <option value="Đang làm việc">Đang làm việc</option>
            <option value="Tạm nghỉ">Tạm nghỉ</option>
            <option value="Nghỉ việc">Nghỉ việc</option>
          </select>
          <select 
            value={filters.team}
            onChange={e => setFilters({...filters, team: e.target.value})}
            className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium"
          >
            <option value="">Tất cả đội nhóm</option>
            {(options?.teamGroups || []).map((t: string) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nhân sự</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phân loại</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Giới tính</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày vào làm</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tình trạng</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đội / Nhóm</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thâm niên</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                        {employee.profileImageUrl ? (
                          <img src={employee.profileImageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <User size={20} />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{employee.fullName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{employee.employeeCode}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      employee.employeeType === 'Nhân viên' ? 'bg-blue-100 text-blue-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      {employee.employeeType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{employee.gender}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{format(new Date(employee.joinDate), 'dd/MM/yyyy')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      employee.workStatus === 'Đang làm việc' ? 'bg-emerald-100 text-emerald-600' :
                      employee.workStatus === 'Tạm nghỉ' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {employee.workStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-700">{employee.teamGroup}</div>
                    {employee.staffLevel && <div className="text-[10px] font-bold text-slate-400 uppercase">{employee.staffLevel}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{calculateTenure(employee.joinDate)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => onView(employee)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => onEdit(employee)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => employee.id && onDelete(employee.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">Không tìm thấy nhân sự nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
