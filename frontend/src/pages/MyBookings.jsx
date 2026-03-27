import React, { useState, useEffect } from 'react';
import { bookingService } from '../services/api';
import { CheckCircle, Clock, XCircle, QrCode, Key, Calendar, MapPin } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { formatVND } from '../utils/format';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQR, setSelectedQR] = useState(null);
  const [cancelling, setCancelling] = useState(null); // bookingId being cancelled
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [targetBookingId, setTargetBookingId] = useState(null);

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        const res = await bookingService.getMyBookings();
        setBookings(res.data);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyBookings();
  }, []);

  const handleCancelClick = (bookingId) => {
    setTargetBookingId(bookingId);
    setShowCancelModal(true);
  };

  const submitCancel = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy');
      return;
    }

    setCancelling(targetBookingId);
    try {
      await bookingService.cancelBooking(targetBookingId, cancelReason);
      setBookings((prev) =>
        prev.map((b) => (b.id === targetBookingId ? { ...b, status: 'cancelled', cancel_reason: cancelReason } : b))
      );
      setShowCancelModal(false);
      setCancelReason('');
      setTargetBookingId(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Hủy đặt phòng thất bại. Vui lòng thử lại.');
    } finally {
      setCancelling(null);
    }
  };

  const handleDeleteHistory = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn đặt này khỏi lịch sử hiển thị không?')) return;
    
    try {
      await bookingService.deleteBookingHistory(bookingId);
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } catch (err) {
      alert('Không thể xóa lịch sử. Vui lòng thử lại.');
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-50 text-green-600 border-green-100';
      case 'pending': return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return <CheckCircle size={16} />;
      case 'pending': return <Clock size={16} />;
      case 'cancelled': return <XCircle size={16} />;
      default: return null;
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Đang tải lịch sử đặt phòng...</div>;

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12">
          <h1 className="text-4xl font-black text-blue-900 tracking-tight">Đơn đặt của tôi</h1>
          <p className="text-gray-500 mt-2 font-medium">Quản lý lịch trình và mã truy cập phòng của bạn</p>
        </header>

        {bookings.length === 0 ? (
          <div className="bg-white p-20 rounded-[3rem] text-center shadow-xl border border-gray-100">
            <Calendar size={64} className="mx-auto text-gray-200 mb-6" />
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Bạn chưa có đơn đặt nào</h3>
            <p className="text-gray-400 mb-8">Hãy bắt đầu hành trình của bạn bằng cách chọn một căn phòng ưng ý.</p>
            <a href="/rooms" className="inline-block bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Khám phá ngay</a>
          </div>
        ) : (
          <div className="grid gap-8">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden flex flex-col md:flex-row group transition-all hover:shadow-2xl">
                <div className="w-full md:w-80 h-64 md:h-auto overflow-hidden">
                   <img 
                    src={`https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=800`} 
                    alt="Room" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="flex-1 p-8 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                             <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getStatusStyle(booking.status)}`}>
                                {getStatusIcon(booking.status)} {booking.status === 'confirmed' ? 'Đã xác nhận' : booking.status === 'pending' ? 'Chờ xử lý' : 'Đã hủy'}
                             </span>
                             <span className="text-xs font-bold text-gray-300">#{booking.id}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">Phòng {booking.Room?.room_number}</h3>
                        <p className="text-gray-400 font-medium text-sm capitalize">{booking.Room?.room_type}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Tổng cộng</p>
                        <p className="text-2xl font-black text-blue-600">{formatVND(booking.total_price)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 bg-gray-50 p-6 rounded-3xl mb-8">
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Nhận phòng</p>
                        <p className="font-bold text-gray-700">{format(new Date(booking.check_in), "HH:mm, dd MMM", { locale: vi })}</p>
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Trả phòng</p>
                        <p className="font-bold text-gray-700">{format(new Date(booking.check_out), "HH:mm, dd MMM", { locale: vi })}</p>
                    </div>
                  </div>

                   <div className="mt-auto flex items-center justify-between gap-4">
                     <div className="flex gap-4 flex-wrap">
                        {booking.status === 'confirmed' && booking.access_code && (
                            <button 
                                onClick={() => setSelectedQR({ id: booking.id, code: booking.access_code, room: booking.Room?.room_number })}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
                            >
                                <QrCode size={18} /> QR Check-in
                            </button>
                        )}
                        <button className="text-gray-400 font-bold text-sm hover:text-gray-600 transition-all">Chi tiết đơn</button>
                     </div>

                     <div className="flex items-center gap-3">
                        {booking.access_code && booking.status === 'confirmed' && (
                            <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl">
                               <Key size={16} />
                               <span className="font-black tracking-widest">{booking.access_code}</span>
                            </div>
                        )}
                        {booking.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancelClick(booking.id)}
                            disabled={cancelling === booking.id}
                            className="flex items-center gap-2 bg-red-50 text-red-500 border border-red-100 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle size={16} />
                            {cancelling === booking.id ? 'Đang hủy...' : 'Hủy đặt phòng'}
                          </button>
                        )}
                        {booking.status === 'cancelled' && (
                          <button
                            onClick={() => handleDeleteHistory(booking.id)}
                            className="flex items-center gap-2 bg-gray-50 text-gray-500 border border-gray-100 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all font-bold"
                          >
                            <XCircle size={16} />
                            Xóa lịch
                          </button>
                        )}
                     </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                    <h4 className="text-xl font-black text-gray-800 uppercase tracking-tight">Mã QR Check-in</h4>
                    <button onClick={() => setSelectedQR(null)} className="text-gray-300 hover:text-gray-800 transition-all">
                        <XCircle size={24} />
                    </button>
                </div>
                
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 inline-block mb-8">
                    <QRCodeCanvas 
                        value={JSON.stringify({ 
                            bookingId: selectedQR.id, 
                            code: selectedQR.code,
                            room: selectedQR.room 
                        })} 
                        size={200}
                        level="H"
                    />
                </div>
                
                <h5 className="text-lg font-bold text-gray-800 mb-2">Phòng {selectedQR.room}</h5>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">Đưa mã này trước thiết bị cảm biến tại khách sạn để làm thủ tục nhận phòng tự động.</p>
                
                <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-center gap-3 text-blue-600">
                    <Key size={20} />
                    <span className="text-2xl font-black tracking-[0.3em] ml-1">{selectedQR.code}</span>
                </div>
             </div>
        </div>
      )}
      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-300">
            <h4 className="text-2xl font-black text-gray-800 mb-2 tracking-tight">Lý do hủy đặt phòng</h4>
            <p className="text-gray-400 text-sm mb-6">Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn đặt phòng này.</p>
            
            <textarea
              className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 text-gray-700 font-medium h-32 outline-none focus:ring-2 focus:ring-red-500/20 mb-6 transition-all"
              placeholder="Nhập lý do tại đây..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setTargetBookingId(null);
                }}
                className="flex-1 py-4 rounded-xl font-bold text-gray-400 hover:bg-gray-50 transition-all"
              >
                Đóng
              </button>
              <button
                onClick={submitCancel}
                disabled={cancelling !== null}
                className="flex-[2] bg-red-500 text-white py-4 rounded-xl font-black shadow-lg shadow-red-100 hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Clock className="animate-spin" size={18} /> Đang xử lý...
                  </>
                ) : (
                  'Xác nhận hủy'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
