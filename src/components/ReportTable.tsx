import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Edit2, 
  Trash2, 
  Eye,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  X,
  Calendar,
  User,
  MapPin,
  Layers,
  Box,
  Hash,
  CheckCircle,
  MessageSquare,
  Image as ImageIcon,
  Briefcase,
  Clock,
  Users,
  Sprout,
  Compass,
  Info,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from 'motion/react';
import { Report, AreaType, FestivalType, WorkType, ModuleType } from '../types';
import { api } from '../services/api';

interface ReportTableProps {
  onEdit: (report: Report) => void;
  activeModule: ModuleType;
  initialFilters?: {
    searchTerm?: string;
    filterArea?: string;
    filterFestival?: string;
    filterType?: string;
    filterModule?: string;
  };
}

export default function ReportTable({ onEdit, activeModule, initialFilters }: ReportTableProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [settings, setSettings] = useState<any>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
  const [filterArea, setFilterArea] = useState<string>(initialFilters?.filterArea || '');
  const [filterFestival, setFilterFestival] = useState<string>(initialFilters?.filterFestival || '');
  const [filterType, setFilterType] = useState<string>(initialFilters?.filterType || '');
  const [filterModule, setFilterModule] = useState<string>(initialFilters?.filterModule || activeModule);

  useEffect(() => {
    if (initialFilters) {
      setSearchTerm(initialFilters.searchTerm || '');
      setFilterArea(initialFilters.filterArea || '');
      setFilterFestival(initialFilters.filterFestival || '');
      setFilterType(initialFilters.filterType || '');
      setFilterModule(initialFilters.filterModule || activeModule);
    }
  }, [initialFilters, activeModule]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsData, settingsData] = await Promise.all([
        api.getReports(),
        api.getSettings()
      ]);
      setReports(reportsData);
      setSettings(settingsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = reports;
    if (searchTerm) {
      result = result.filter(r => r.reporter.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (filterModule) {
      result = result.filter(r => r.module === filterModule);
    }
    if (filterArea) {
      result = result.filter(r => r.area === filterArea);
    }
    if (filterFestival) {
      result = result.filter(r => r.festival === filterFestival);
    }
    if (filterType) {
      result = result.filter(r => r.workType === filterType);
    }
    setFilteredReports(result);
  }, [searchTerm, filterArea, filterFestival, filterType, filterModule, reports]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc chắn muốn xoá báo cáo này?')) {
      try {
        await api.deleteReport(id);
        setReports(reports.filter(r => r.id !== id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEditClick = (e: React.MouseEvent, report: Report) => {
    e.stopPropagation();
    onEdit(report);
  };

  const exportToExcel = () => {
    const dataToExport = filteredReports.map(r => ({
      'Module': r.module || 'Lễ hội',
      'Ngày': r.reportDate,
      'Người báo cáo': r.reporter,
      'Loại CV': r.workType || '-',
      'Festival': r.festival || '-',
      'Khu vực': r.area,
      'Công đoạn/Vị trí': r.module === 'Thi công cây hoa' ? r.location : r.stage,
      'Sản phẩm/Cây': r.module === 'Thi công cây hoa' ? r.treeType : (r.productType || '-'),
      'Số lượng': r.module === 'Thi công cây hoa' ? r.treeQuantity : (r.quantity || '-'),
      'Số công': r.module === 'Thi công cây hoa' ? r.manDays : '-',
      'Tiến độ': r.progress ? `${r.progress}%` : '-',
      'Trạng thái': r.status,
      'Ghi chú': r.notes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Báo cáo thi công");
    XLSX.writeFile(wb, `NhatKyThiCong_${format(new Date(), 'yyyyMMdd')}.xlsx`);
  };

  if (loading) return <div className="text-center py-12">Đang tải danh sách...</div>;

  return (
    <div className="space-y-6">
      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo người báo cáo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all ${
              activeModule === 'Lễ hội' ? 'focus:ring-primary/20 focus:border-primary' : 'focus:ring-emerald-500/20 focus:border-emerald-500'
            }`}
          />
        </div>
        
        <select 
          value={filterArea}
          onChange={e => setFilterArea(e.target.value)}
          className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none"
        >
          <option value="">Tất cả Khu vực</option>
          {settings?.areas?.map((a: string) => <option key={a} value={a}>{a}</option>)}
        </select>

        {filterModule !== 'Thi công cây hoa' && (
          <>
            <select 
              value={filterFestival}
              onChange={e => setFilterFestival(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none"
            >
              <option value="">Tất cả Festival</option>
              {settings?.festivals?.map((f: string) => <option key={f} value={f}>{f}</option>)}
            </select>

            <select 
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 outline-none"
            >
              <option value="">Tất cả Loại CV</option>
              {['Cải tạo', 'Festival'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </>
        )}

        <button 
          onClick={exportToExcel}
          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20"
        >
          <FileSpreadsheet size={18} />
          <span>Xuất Excel</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ảnh</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Ngày</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Người báo cáo</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Khu vực / Module</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Công đoạn / Vị trí</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Tiến độ / SL / Công</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredReports.map((report) => (
                <tr 
                  key={report.id} 
                  onClick={() => setSelectedReport(report)}
                  className="group hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                      {report.photos && report.photos.length > 0 ? (
                        <img src={report.photos[0]} alt="Thumbnail" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">
                    {format(new Date(report.reportDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${report.module === 'Thi công cây hoa' ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'} rounded-full flex items-center justify-center font-bold text-xs`}>
                        {report.reporter.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{report.reporter}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-slate-700">{report.area}</div>
                    <div className={`text-[10px] font-bold uppercase tracking-wider ${report.module === 'Thi công cây hoa' ? 'text-emerald-500' : 'text-slate-400'}`}>
                      {report.module === 'Thi công cây hoa' ? 'Thi công cây hoa' : (report.festival || report.workType)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {report.module === 'Thi công cây hoa' ? report.location : report.stage}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {report.module === 'Thi công cây hoa' ? (
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-emerald-600">{report.treeQuantity} cây</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{report.manDays} công</div>
                      </div>
                    ) : (
                      <>
                        {report.stage === 'Gia công sản phẩm' ? (
                          <span className="text-sm font-bold text-primary">{report.quantity} SP</span>
                        ) : (
                          <div className="w-24">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1">
                              <span>TIẾN ĐỘ</span>
                              <span>{report.progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full" 
                                style={{ width: `${report.progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-800' :
                      report.status === 'Chậm tiến độ' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => handleEditClick(e, report)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
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
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${selectedReport.module === 'Thi công cây hoa' ? 'bg-emerald-600' : 'bg-primary'} text-white rounded-2xl flex items-center justify-center font-bold text-xl`}>
                    {selectedReport.reporter.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">Chi tiết báo cáo</h3>
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

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Module</p>
                    <div className={`flex items-center gap-2 font-bold ${selectedReport.module === 'Thi công cây hoa' ? 'text-emerald-600' : 'text-primary'}`}>
                      {selectedReport.module === 'Thi công cây hoa' ? <Sprout size={16} /> : <Activity size={16} />}
                      {selectedReport.module || 'Lễ hội'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khu vực</p>
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <MapPin size={16} className="text-accent" />
                      {selectedReport.area}
                    </div>
                  </div>
                  
                  {selectedReport.module === 'Thi công cây hoa' ? (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vị trí thi công</p>
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                          <MapPin size={16} className="text-emerald-500" />
                          {selectedReport.location}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Vùng đất</p>
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                          <Compass size={16} className="text-blue-500" />
                          {selectedReport.landZone}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Đội thi công</p>
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                          <Users size={16} className="text-purple-500" />
                          {selectedReport.constructionTeam}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ca làm việc</p>
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                          <Clock size={16} className="text-amber-500" />
                          {selectedReport.shift}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại công việc</p>
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                          <Briefcase size={16} className="text-primary" />
                          {selectedReport.workType}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Công đoạn</p>
                        <div className="flex items-center gap-2 text-slate-700 font-semibold">
                          <Layers size={16} className="text-emerald-500" />
                          {selectedReport.stage}
                        </div>
                      </div>
                      {selectedReport.festival && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Festival</p>
                          <div className="flex items-center gap-2 text-slate-700 font-semibold">
                            <span className="text-lg">🎡</span>
                            {selectedReport.festival}
                          </div>
                        </div>
                      )}
                      {selectedReport.productType && (
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loại sản phẩm</p>
                          <div className="flex items-center gap-2 text-slate-700 font-semibold">
                            <Box size={16} className="text-amber-500" />
                            {selectedReport.productType}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Landscape Specific Details */}
                {selectedReport.module === 'Thi công cây hoa' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Sprout size={16} className="text-emerald-600" /> Thông tin cây trồng
                      </h4>
                      <div className="bg-slate-50 p-6 rounded-3xl space-y-4 border border-slate-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Loại cây:</span>
                          <span className="text-sm font-bold text-slate-800">{selectedReport.treeType}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Phân loại:</span>
                          <span className="text-sm font-bold text-slate-800">{selectedReport.treeClassification}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500">Nguồn cây:</span>
                          <span className="text-sm font-bold text-slate-800">{selectedReport.treeSource}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                          <span className="text-sm font-bold text-slate-600">Số lượng:</span>
                          <span className="text-lg font-black text-emerald-600">{selectedReport.treeQuantity} cây</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Clock size={16} className="text-blue-600" /> Hiệu suất thi công
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
                          <span className="text-lg font-black text-blue-600">{selectedReport.manDays} công</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress & Status */}
                <div className="bg-slate-50 rounded-3xl p-6 flex flex-wrap items-center gap-8">
                  {selectedReport.module !== 'Thi công cây hoa' && selectedReport.stage !== 'Gia công sản phẩm' && (
                    <div className="flex-1 min-w-[200px] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">Tiến độ thi công</span>
                        <span className="text-primary font-bold">{selectedReport.progress}%</span>
                      </div>
                      <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-slate-200">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedReport.progress}%` }}
                          className="h-full bg-primary rounded-full"
                        />
                      </div>
                    </div>
                  )}
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trạng thái hiện tại</p>
                    <div className={`px-4 py-2 rounded-2xl font-bold flex items-center gap-2 ${
                      selectedReport.status === 'Hoàn thành' ? 'bg-emerald-100 text-emerald-700' :
                      selectedReport.status === 'Chậm tiến độ' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      <CheckCircle size={18} />
                      {selectedReport.status}
                    </div>
                  </div>
                </div>

                {/* Notes */}
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

                {/* Photos */}
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
                    {(!selectedReport.photos || selectedReport.photos.length === 0) && (
                      <div className="col-span-full py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400">
                        <ImageIcon size={40} className="mb-2 opacity-20" />
                        <p className="text-sm">Không có hình ảnh đính kèm</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
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
                  className={`px-8 py-3 ${selectedReport.module === 'Thi công cây hoa' ? 'bg-emerald-600 shadow-emerald-600/20' : 'bg-primary shadow-primary/20'} text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg flex items-center gap-2`}
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
