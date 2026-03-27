import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Search,
  ChevronRight
} from 'lucide-react';
import { adminService } from '../../services/api';
import { format } from 'date-fns';
import { formatVND } from '../../utils/format';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: { totalRevenue: 0, totalBookings: 0 },
    revenueByType: [],
    details: []
  });
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await adminService.getReports(filters);
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch reports', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleExport = () => {
    // Basic mock of export
    alert("Tính năng xuất báo cáo (Excel/PDF) đang được phát triển.");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Báo cáo & Phân tích</h1>
          <p className="text-gray-400 mt-1 font-medium">Theo dõi hiệu suất kinh doanh và doanh thu chi tiết</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-gray-200"
        >
          <Download size={18} />
          Xuất báo cáo
        </button>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center gap-6">
        <div className="flex items-center gap-3 flex-1">
          <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
            <Calendar size={20} />
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="date" 
              className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            />
            <span className="text-gray-300 font-bold">→</span>
            <input 
              type="date" 
              className="bg-gray-50 px-4 py-2 rounded-xl text-sm font-bold border-none outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            />
          </div>
        </div>
        <button 
          onClick={fetchReports}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Lọc dữ liệu
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-8 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-1">Doanh thu thời kỳ</p>
            <h3 className="text-4xl font-black">{formatVND(data.summary.totalRevenue)}</h3>
            <div className="mt-4 flex items-center gap-2 text-blue-100 text-sm font-medium">
              <TrendingUp size={16} />
              <span>Dựa trên {data.summary.totalBookings} đơn đặt phòng</span>
            </div>
          </div>
        </div>

        {data.revenueByType.map((item, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col justify-center">
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Doanh thu {item.type}</p>
            <h3 className="text-3xl font-black text-gray-800">{formatVND(item.revenue)}</h3>
            <div className="w-full bg-gray-100 h-1.5 rounded-full mt-4 overflow-hidden">
               <div 
                 className="bg-blue-500 h-full rounded-full" 
                 style={{ width: `${(item.revenue / (data.summary.totalRevenue || 1)) * 100}%` }}
               />
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-xl">Chi tiết giao dịch</h3>
          <span className="text-sm font-bold text-gray-400">{data.details.length} kết quả</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Ngày đặt</th>
                <th className="px-8 py-4">Phòng</th>
                <th className="px-8 py-4">Loại</th>
                <th className="px-8 py-4">Thời gian lưu trú</th>
                <th className="px-8 py-4 text-right">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.details.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-700">{format(new Date(b.check_in), 'dd/MM/yyyy')}</p>
                    <p className="text-[10px] text-gray-400 font-bold flex items-center gap-1 uppercase tracking-tighter">
                      ID: #{b.id} <ChevronRight size={10} />
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg font-mono font-bold text-xs text-gray-800">
                      P.{b.Room?.room_number}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-sm font-bold text-gray-500 capitalize">{b.Room?.room_type}</span>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-gray-600">
                      {format(new Date(b.check_in), 'HH:mm')} - {format(new Date(b.check_out), 'HH:mm')}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{b.booking_type === 'hourly' ? 'Theo giờ' : 'Theo ngày'}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="font-black text-gray-900 text-lg">{formatVND(b.total_price)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.details.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Search size={32} />
              </div>
              <p className="text-gray-400 font-bold">Không tìm thấy dữ liệu trong khoảng thời gian này</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;
