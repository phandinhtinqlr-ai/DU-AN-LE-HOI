import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  MapPin, 
  Edit2, 
  Trash2, 
  Eye, 
  X, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  ImageIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Droplets
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Report, MaintenanceType, PlantStatusType, AreaType, LandZoneType } from '../types';
import { api } from '../services/api';

interface MaintenanceReportTableProps {
  onEdit: (report: Report) => void;
  onDelete: (id: number) => void;
}

export default function MaintenanceReportTable({ onEdit, onDelete }: MaintenanceReportTableProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    area: '',
    landZone: '',
    maintenanceType: '',
    plantStatus: '',
    team: ''
  });
  const [options, setOptions] = useState<any>(null);

  const fetchReports = async () => {
    try {
      const data = await api.getReports();
      setReports(data.filter(r => r.module === 'Bảo dưỡng'));
      const settings = await api.getSettings();
      setOptions(settings);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'NEW_REPORT' || data.type === 'UPDATE_REPORT' || data.type === 'DELETE_REPORT') {
        fetchReports();
      }
    };
    return () => ws.close();
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.reporter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (report.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = !filters.date || report.reportDate === filters.date;
    const matchesArea = !filters.area || report.area === filters.area;
    const matchesLandZone = !filters.landZone || report.landZone === filters.landZone;
    const matchesType = !filters.maintenanceType || report.maintenanceType === filters.maintenanceType;
    const matchesStatus = !filters.plantStatus || report.plantStatus === filters.plantStatus;
    const matchesTeam = !filters.team || (report.constructionTeam || '').toLowerCase().includes(filters.team.toLowerCase());

    return matchesSearch && matchesDate && matchesArea && matchesLandZone && matchesType && matchesStatus && matchesTeam;
  });

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
      try {
        await api.deleteReport(id);
        onDelete(id);
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent, report: Report) => {
    e.stopPropagation();
    onEdit(report);
  };

  if (loading) return <div className="text-center py-12">Đang tải danh sách báo cáo...</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[240px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo người báo cáo, ghi chú..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 focus:ring-emerald-500/20 transition-all"
            />
          </div>
          <div className="flex gap-2">
            <input 
              type="date" 
              value={filters.date}
              onChange={e => setFilters({...filters, date: e.target.value})}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-emerald-500 transition-all text-sm"
            />
            <button 
              onClick={() => setFilters({ date: '', area: '', landZone: '', maintenanceType: '', plantStatus: '', team: '' })}
              className="px-4 py-2 text-slate-500 hover:text-emerald-600 font-medium text-sm"
            >
              Xóa lọc
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <select 
            value={filters.area}
            onChange={e => setFilters({...filters, area: e.target.value})}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
          >
            <option value="">Tất cả khu vực</option>
            {(options?.areas || []).map((a: string) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select 
            value={filters.landZone}
            onChange={e => setFilters({...filters, landZone: e.target.value})}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
          >
            <option value="">Tất cả vùng đất</option>
            {(options?.landZones || []).map((z: string) => <option key={z} value={z}>{z}</option>)}
          </select>
          <select 
            value={filters.maintenanceType}
            onChange={e => setFilters({...filters, maintenanceType: e.target.value})}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
          >
            <option value="">Tất cả loại CV</option>
            {(options?.maintenanceTypes || []).map((t: string) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select 
            value={filters.plantStatus}
            onChange={e => setFilters({...filters, plantStatus: e.target.value})}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
          >
            <option value="">Tất cả tình trạng</option>
            {(options?.plantStatuses || []).map((s: string) => <option key={s} value={s}>{s}</option>)}
          </select>
          <input 
            type="text" 
            placeholder="Đội chăm sóc..."
            value={filters.team}
            onChange={e => setFilters({...filters, team: e.target.value})}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ngày</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Người báo cáo</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khu vực / Vùng đất</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại công việc</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khối lượng / Công</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tình trạng</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ảnh</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr 
                  key={report.id} 
                  className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                  onClick={() => setSelectedReport(report)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                    {format(new Date(report.reportDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center font-bold text-xs">
                        {report.reporter.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{report.reporter}</div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">{report.constructionTeam}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-600">{report.area}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase">{report.landZone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-800">{report.maintenanceType === 'Khác' ? report.customMaintenanceType : report.maintenanceType}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">{report.plantCategory}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-emerald-600">{report.quantity} {report.unitType === 'Khác' ? report.customUnitType : report.unitType}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.manDays} công</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.plantStatus === 'Tốt' ? 'bg-emerald-100 text-emerald-800' :
                      report.plantStatus === 'Sâu bệnh' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {report.plantStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex -space-x-2 overflow-hidden">
                      {report.photos?.slice(0, 3).map((photo, i) => (
                        <img 
                          key={i} 
                          src={photo} 
                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover" 
                          alt="" 
                        />
                      ))}
                      {report.photos && report.photos.length > 3 && (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400 ring-2 ring-white">
                          +{report.photos.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleEditClick(e, report)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => report.id && handleDelete(e, report.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">Không tìm thấy báo cáo nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl">
                    {selectedReport.reporter.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Chi tiết báo cáo bảo dưỡng</h3>
                    <p className="text-sm text-slate-500">Gửi bởi {selectedReport.reporter} • {format(new Date(selectedReport.reportDate), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <MapPin size={16} className="text-emerald-600" /> Vị trí & Đội ngũ
                    </h4>
                    <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Khu vực:</span>
                        <span className="text-sm font-bold text-slate-800">{selectedReport.area}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Vùng đất:</span>
                        <span className="text-sm font-bold text-slate-800">{selectedReport.landZone}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-sm text-slate-500">Đội chăm sóc:</span>
                        <span className="text-sm font-bold text-emerald-600">{selectedReport.constructionTeam}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Ca trực:</span>
                        <span className="text-sm font-bold text-slate-800">{selectedReport.shift}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Droplets size={16} className="text-blue-600" /> Nội dung công việc
                    </h4>
                    <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Loại CV:</span>
                        <span className="text-sm font-bold text-slate-800">{selectedReport.maintenanceType === 'Khác' ? selectedReport.customMaintenanceType : selectedReport.maintenanceType}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Phân loại cây:</span>
                        <span className="text-sm font-bold text-slate-800">{selectedReport.plantCategory}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-sm text-slate-500">Khối lượng:</span>
                        <span className="text-sm font-bold text-emerald-600">{selectedReport.quantity} {selectedReport.unitType === 'Khác' ? selectedReport.customUnitType : selectedReport.unitType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <Clock size={16} className="text-amber-600" /> Nhân công
                    </h4>
                    <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Số giờ:</span>
                        <span className="text-sm font-bold text-slate-800">{selectedReport.constructionHours} giờ</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-500">Số người:</span>
                        <span className="text-sm font-bold text-slate-800">{selectedReport.workerCount} người</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-sm font-bold text-slate-600">Tổng số công:</span>
                        <span className="text-lg font-black text-emerald-600">{selectedReport.manDays} công</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-6 flex flex-wrap items-center gap-8">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tình trạng cây / cảnh quan</p>
                    <div className={`px-4 py-2 rounded-2xl font-bold flex items-center gap-2 ${
                      selectedReport.plantStatus === 'Tốt' ? 'bg-emerald-100 text-emerald-700' :
                      selectedReport.plantStatus === 'Sâu bệnh' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      <CheckCircle size={18} />
                      {selectedReport.plantStatus}
                    </div>
                  </div>
                </div>

                {selectedReport.notes && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                      <MessageSquare size={18} className="text-slate-400" />
                      Ghi chú hiện trường
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl text-slate-600 leading-relaxed border border-slate-100 italic">
                      "{selectedReport.notes}"
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                    <ImageIcon size={18} className="text-slate-400" />
                    Hình ảnh hiện trường ({selectedReport.photos?.length || 0})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {selectedReport.photos?.map((photo, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.02 }}
                        className="aspect-square rounded-2xl overflow-hidden border border-slate-200 shadow-sm cursor-zoom-in"
                        onClick={() => window.open(photo, '_blank')}
                      >
                        <img src={photo} alt={`Field ${i}`} className="w-full h-full object-cover" />
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4 text-[10px] text-slate-400 flex justify-between">
                  <span>Tạo lúc: {selectedReport.createdAt ? format(new Date(selectedReport.createdAt), 'HH:mm dd/MM/yyyy') : 'N/A'}</span>
                  <span>Cập nhật cuối: {selectedReport.updatedAt ? format(new Date(selectedReport.updatedAt), 'HH:mm dd/MM/yyyy') : 'N/A'}</span>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  onClick={() => setSelectedReport(null)}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Đóng
                </button>
                <button 
                  onClick={(e) => {
                    handleEditClick(e, selectedReport);
                    setSelectedReport(null);
                  }}
                  className="px-8 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center gap-2"
                >
                  <Edit2 size={18} />
                  Chỉnh sửa báo cáo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
