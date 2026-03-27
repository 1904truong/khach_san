import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  BedDouble, 
  User as UserIcon, 
  CheckCircle,
  Clock,
  LayoutDashboard,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/api';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { formatVND } from '../../utils/format';

const AdminBookings = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: 'all',
    search: ''
  });

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingService.getAllBookings();
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch bookings', err);
      }
      setLoading(false);
    };
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = filter.status === 'all' || b.status === filter.status;
    const matchesSearch = b.User.username.toLowerCase().includes(filter.search.toLowerCase()) || 
                          b.Room.room_number.includes(filter.search);
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-800 tracking-tight">Quản lý Đặt phòng</h1>
          <p className="text-gray-400 mt-1 font-medium">Quản lý tất cả các lượt đặt chỗ và lịch trình</p>
        </div>
      </header>

        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <div className="flex-1 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
            <Search className="text-gray-300" size={20} />
            <input 
              type="text" 
              placeholder="Tìm kiếm theo người dùng hoặc phòng..."
              className="flex-1 outline-none text-sm font-medium"
              value={filter.search}
              onChange={(e) => setFilter({...filter, search: e.target.value})}
            />
          </div>
          <select 
            className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100 text-sm font-bold outline-none"
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-black uppercase tracking-[0.2em]">
                <th className="px-8 py-6">Khách hàng</th>
                <th className="px-8 py-6">Phòng</th>
                <th className="px-8 py-6">Lịch trình</th>
                <th className="px-8 py-6">Trạng thái</th>
                <th className="px-8 py-6">Tổng cộng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 underline-offset-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                        <UserIcon size={16} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{booking.User.username}</p>
                        <p className="text-xs text-gray-400 tracking-tighter">{booking.User.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="font-bold text-gray-800">Room {booking.Room.room_number}</p>
                    <p className="text-xs text-gray-400 capitalize">{booking.Room.room_type}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                      <Clock size={14} className="text-blue-400" />
                      <span>{format(new Date(booking.check_in), 'MMM dd, HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400 font-medium mt-1">
                      <Clock size={14} />
                      <span>{format(new Date(booking.check_out), 'MMM dd, HH:mm')}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      booking.status === 'confirmed' ? 'bg-green-50 text-green-600' : 
                      booking.status === 'pending' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {booking.status === 'confirmed' ? 'Đã xác nhận' : 
                       booking.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="px-8 py-6 font-black text-gray-800 text-lg">
                    {formatVND(booking.total_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="p-20 text-center text-gray-400 font-bold">Không tìm thấy đơn đặt phòng nào</div>
          )}
        </div>
    </>
  );
};

export default AdminBookings;
