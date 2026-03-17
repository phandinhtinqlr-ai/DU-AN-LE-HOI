import React from 'react';
import { Activity } from 'lucide-react';
import { Log } from '../types';
import { format } from 'date-fns';

interface SystemLogProps {
  logs: Log[];
}

export default function SystemLog({ logs }: SystemLogProps) {
  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
          <Activity size={20} />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Lịch sử thao tác</h3>
      </div>
      
      <div className="space-y-4">
        {logs.length > 0 ? (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800">{log.action}</p>
                <p className="text-xs text-slate-500">{log.module} • {log.user}</p>
                {log.details && <p className="text-xs text-slate-600 mt-1">{log.details}</p>}
              </div>
              <div className="text-xs font-bold text-slate-400">
                {format(new Date(log.timestamp), 'HH:mm dd/MM/yyyy')}
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-slate-400 py-8 italic">Chưa có lịch sử thao tác nào</p>
        )}
      </div>
    </div>
  );
}
