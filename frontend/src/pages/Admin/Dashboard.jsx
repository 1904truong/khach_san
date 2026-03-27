import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  BedDouble, 
  CheckSquare, 
  DollarSign, 
  TrendingUp,
  Settings,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { roomService, bookingService, housekeepingService, adminService } from '../../services/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { Link } from 'react-router-dom';
import { formatVND } from '../../utils/format';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalBookings: 0,
    occupancyRate: 0,
    pendingCleaning: 0
  });
  const [advancedStats, setAdvancedStats] = useState({
    dailyRevenue: [],
    monthlyRevenue: [],
    roomOccupancy: [],
    topRooms: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [roomsRes, revRes, occRes, advRes] = await Promise.all([
          roomService.getRooms(),
          adminService.getRevenueStats(),
          adminService.getOccupancyStats(),
          adminService.getAdvancedStats()
        ]);
        
        setRooms(roomsRes.data);
        setStats({
          totalRevenue: revRes.data.totalRevenue,
          totalBookings: revRes.data.totalBookings,
          occupancyRate: occRes.data.occupancyRate,
          pendingCleaning: roomsRes.data.filter(r => r.housekeeping_status !== 'cleaned').length
        });

        const formatDate = (dateStr) => {
          try {
            const d = new Date(dateStr);
            return isNaN(d) ? dateStr : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
          } catch { return dateStr; }
        };

        setAdvancedStats({
          dailyRevenue: (advRes.data.dailyRevenue || []).map(d => ({ 
            name: formatDate(d.date), 
            rev: parseFloat(d.revenue) 
          })),
          monthlyRevenue: (advRes.data.monthlyRevenue || []).length > 0 
            ? advRes.data.monthlyRevenue.map(m => ({ name: m.month, rev: parseFloat(m.revenue) }))
            : (advRes.data.dailyRevenue || []).slice(-1).map(d => ({ name: 'Tháng này', rev: parseFloat(d.revenue) })),
          roomOccupancy: (advRes.data.roomOccupancy || []).map(ro => ({ name: ro.type, occ: ro.occupancy })),
          topRooms: (advRes.data.topRooms || []).map(tr => ({ 
            name: `P.${tr.Room?.room_number || '?' }`, 
            count: parseInt(tr.booking_count) 
          }))
        });
      } catch (err) {
        console.error('Fetch error:', err);
      }
      setLoading(false);
    };
    fetchData();
  }, [activeTab]);

  const updateHousekeeping = async (roomId, status) => {
    try {
      await housekeepingService.updateStatus({ room_id: roomId, status });
      const updatedRooms = rooms.map(r => r.id === roomId ? { ...r, housekeeping_status: status } : r);
      setRooms(updatedRooms);
      setStats(prev => ({
        ...prev,
        pendingCleaning: updatedRooms.filter(r => r.housekeeping_status !== 'cleaned').length
      }));
    } catch (err) {
      alert('Update failed');
    }
  };

  const SidebarItem = ({ icon: Icon, label, id }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${activeTab === id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-gray-400 hover:bg-gray-50'}`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <>
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight capitalize">{activeTab === 'overview' ? 'Tổng quan' : activeTab === 'housekeeping' ? 'Dọn dẹp' : activeTab}</h1>
          <p className="text-gray-400 mt-1 font-medium">Chào mừng quay lại, Quản trị viên</p>
        </div>
        <div className="flex gap-4">
           <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
             <div className="bg-green-100 p-2 rounded-lg text-green-600">
                <TrendingUp size={20} />
             </div>
             <div>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tỷ lệ lấp đầy</p>
                <p className="text-lg font-black text-gray-800">{stats.occupancyRate}%</p>
             </div>
           </div>
        </div>
      </header>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all text-center">
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 mb-6 mx-auto group-hover:rotate-6 transition-transform">
                  <DollarSign size={32} />
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Tổng doanh thu</p>
                <h3 className="text-4xl font-black text-gray-800">{formatVND(stats.totalRevenue)}</h3>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all text-center">
                <div className="bg-indigo-50 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 mx-auto group-hover:rotate-6 transition-transform">
                  <Users size={32} />
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Tổng đơn đặt</p>
                <h3 className="text-4xl font-black text-gray-800">{stats.totalBookings}</h3>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 group hover:shadow-xl transition-all text-center">
                <div className="bg-purple-50 w-16 h-16 rounded-2xl flex items-center justify-center text-purple-600 mb-6 mx-auto group-hover:rotate-6 transition-transform">
                  <CheckSquare size={32} />
                </div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-1">Phòng cần dọn</p>
                <h3 className="text-4xl font-black text-gray-800">{stats.pendingCleaning}</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Doanh thu 7 ngày qua</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={advancedStats.dailyRevenue}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={0} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="rev" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Tỷ lệ lấp đầy theo loại phòng</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={advancedStats.roomOccupancy}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="occ" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Doanh thu hàng tháng</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={advancedStats.monthlyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="rev" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Top 5 phòng được đặt nhiều nhất</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={advancedStats.topRooms} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} width={100} />
                      <Tooltip 
                        cursor={{fill: '#f8fafc'}}
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="count" fill="#f59e0b" radius={[0, 8, 8, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'housekeeping' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Phòng</th>
                  <th className="px-8 py-6">Loại phòng</th>
                  <th className="px-8 py-6">Trạng thái</th>
                  <th className="px-8 py-6">Dọn dẹp</th>
                  <th className="px-8 py-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rooms.map(room => (
                  <tr key={room.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-gray-800">Phòng {room.room_number}</td>
                    <td className="px-8 py-6 text-gray-500 font-medium">{room.room_type}</td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${room.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {room.status === 'available' ? 'Sẵn sàng' : 'Bận'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                       <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${room.housekeeping_status === 'cleaned' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                        {room.housekeeping_status === 'cleaned' ? 'Đã dọn' : room.housekeeping_status === 'cleaning' ? 'Đang dọn' : 'Chưa dọn'}
                      </span>
                    </td>
                     <td className="px-8 py-6 text-right space-x-2">
                       <select 
                         onChange={(e) => updateHousekeeping(room.id, e.target.value)}
                         className="bg-gray-50 border border-gray-200 text-sm font-bold rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                         value={room.housekeeping_status}
                       >
                         <option value="not_cleaned">Chưa dọn</option>
                         <option value="cleaning">Đang dọn</option>
                         <option value="cleaned">Đã dọn</option>
                       </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </>
  );
};

export default AdminDashboard;
