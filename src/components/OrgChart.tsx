import React from 'react';
import { motion } from 'motion/react';
import { Employee } from '../types';
import { User, ChevronDown } from 'lucide-react';

interface OrgChartProps {
  employees: Employee[];
}

export default function OrgChart({ employees }: OrgChartProps) {
  const levels = [
    { id: 'level1', label: 'Trưởng phòng', levels: ['Trưởng phòng'] },
    { id: 'level2', label: 'Giám sát / Chuyên viên / Kiến trúc sư', levels: ['Giám sát', 'Chuyên viên', 'Kiến trúc sư'] },
    { id: 'level3', label: 'Nhân viên kỹ thuật', levels: ['Nhân viên kỹ thuật'] },
    { id: 'level4', label: 'Nhân viên', levels: ['Nhân viên'] },
    { id: 'level5', label: 'Công nhật', levels: ['Công nhật'] },
  ];

  const getEmployeesByLevels = (targetLevels: string[]) => {
    return employees.filter(e => e.staffLevel && targetLevels.includes(e.staffLevel));
  };

  return (
    <div className="space-y-12 py-8 max-w-5xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter">Sơ đồ cơ cấu tổ chức</h2>
        <p className="text-slate-500 font-medium">Phòng Thi công cây hoa - Ba Na Hills</p>
      </div>

      <div className="flex flex-col items-center gap-8">
        {levels.map((level, index) => {
          const levelEmployees = getEmployeesByLevels(level.levels);
          
          return (
            <React.Fragment key={level.id}>
              <div className="w-full space-y-4 flex flex-col items-center">
                <div className="px-6 py-2 bg-slate-100 rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border border-slate-200">
                  {level.label}
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 w-full">
                  {levelEmployees.length > 0 ? (
                    levelEmployees.map((emp) => (
                      <motion.div
                        key={emp.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-4 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-3 min-w-[200px] hover:shadow-md transition-all cursor-default group"
                      >
                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border-2 border-white shadow-sm">
                          {emp.profileImageUrl ? (
                            <img src={emp.profileImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <User size={24} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{emp.fullName}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{emp.employeeCode}</div>
                          <div className="text-[10px] font-black text-blue-500 uppercase mt-0.5">{emp.staffLevel}</div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-slate-300 italic text-sm py-4">Chưa có nhân sự cấp này</div>
                  )}
                </div>
              </div>
              
              {index < levels.length - 1 && (
                <div className="flex flex-col items-center gap-1">
                  <div className="w-px h-8 bg-slate-200" />
                  <ChevronDown size={16} className="text-slate-300" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
