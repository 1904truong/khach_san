import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookingTimeline from '../components/BookingTimeline';
import { format, addHours, startOfHour } from 'date-fns';
import { CheckCircle, Clock, Calendar, Info, CreditCard, QrCode, Scan, UploadCloud, ShieldCheck, RefreshCw, ChevronRight, DollarSign } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { roomService, bookingService, paymentService, ocrService } from '../services/api';
import { formatVND } from '../utils/format';

const Booking = () => {
  const { roomId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingType, setBookingType] = useState('hourly');
  const [checkIn, setCheckIn] = useState(format(addHours(startOfHour(new Date()), 1), "yyyy-MM-dd'T'HH:mm"));
  const [duration, setDuration] = useState(2);
  const [success, setSuccess] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);
  
  // NEW: Multi-step state
  const [currentStep, setCurrentStep] = useState(1);
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrRotation, setOcrRotation] = useState(0);
  const [ocrError, setOcrError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');

  const rotateImage = (blob, degrees) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (degrees % 180 === 0) {
          canvas.width = img.width;
          canvas.height = img.height;
        } else {
          canvas.width = img.height;
          canvas.height = img.width;
        }
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        canvas.toBlob((rotatedBlob) => {
          resolve(rotatedBlob);
        }, 'image/jpeg', 0.95);
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const roomRes = await roomService.getRooms();
        const found = roomRes.data.find(r => r.id === parseInt(roomId));
        setRoom(found);

        try {
          const bookingsRes = await bookingService.getAllBookings();
          setAllBookings(bookingsRes.data);
        } catch (bookingErr) {}

        // Check verification status
        if (user) {
           const verifyRes = await ocrService.checkVerification();
           setIsVerified(verifyRes.data.isVerified);
        }
      } catch (err) {
        console.error("Error fetching room details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomId, user]);

  const handleBooking = async () => {
    if (!user) return navigate('/login');

    const checkInDate = new Date(checkIn);
    const checkOutDate = bookingType === 'hourly' ? addHours(checkInDate, duration) : addHours(checkInDate, 24);
    
    const totalPrice = bookingType === 'hourly' 
      ? room.price_per_hour * duration 
      : room.price_per_day;

    try {
      setVerifying(true);
      const res = await bookingService.createBooking({
        room_id: room.id,
        check_in: checkInDate,
        check_out: checkOutDate,
        booking_type: bookingType,
        total_price: totalPrice,
        bypass_payment: true 
      });
      
      setConfirmedBooking(res.data);
      setSuccess(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Booking failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleOcrVerification = async () => {
    if (!ocrFile) return;
    setVerifying(true);
    setOcrError(null);

    try {
      let fileToUpload = ocrFile;
      if (ocrRotation !== 0) {
        const rotatedBlob = await rotateImage(ocrFile, ocrRotation);
        fileToUpload = new File([rotatedBlob], ocrFile.name, { type: 'image/jpeg' });
      }

      const formData = new FormData();
      formData.append('id_card', fileToUpload);

      await ocrService.extractId(formData);
      setIsVerified(true);
      setCurrentStep(3);
    } catch (err) {
      setOcrError('Không thể xác minh CCCD. Vui lòng thử lại.');
    } finally {
      setVerifying(false);
    }
  };

  const handleOcrRotate = () => {
    setOcrRotation((prev) => (prev + 90) % 360);
  };

  const handleSelectRange = (start, end) => {
    const formattedStart = format(start, "yyyy-MM-dd'T'HH:mm");
    setCheckIn(formattedStart);
    const hours = Math.round((end - start) / (1000 * 60 * 60));
    setDuration(hours || 1);
    setBookingType('hourly');
  };

  const nextStep = () => {
    if (currentStep === 1) {
       if (isVerified) setCurrentStep(3);
       else setCurrentStep(2);
    } else if (currentStep === 2 && isVerified) {
       setCurrentStep(3);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 pb-12 px-4 text-center font-bold text-gray-500">Đang tải thông tin phòng...</div>;
  if (!room) return <div className="min-h-screen pt-24 pb-12 px-4 text-center font-bold text-red-500">Không tìm thấy phòng</div>;

  const getRoomMeta = (roomItem) => {
    if (!roomItem) return { image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=800' };
    const id = roomItem.id || 0;
    const images = [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b'
    ];
    return {
      image: `${images[id % images.length]}?auto=format&fit=crop&q=80&w=800`
    };
  };

  const meta = getRoomMeta(room);

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-[100px] opacity-40 -ml-48 -mt-48 animate-pulse" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-100 rounded-full blur-[100px] opacity-40 -mr-48 -mb-48" />

      <div className="bg-white/80 backdrop-blur-xl p-12 rounded-[4rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] text-center max-w-xl w-full border border-white relative z-10 animate-in zoom-in-95 fade-in duration-700">
        <div className="bg-gradient-to-br from-green-400 to-emerald-600 w-28 h-28 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-xl shadow-green-100 rotate-12">
          <CheckCircle size={56} className="text-white" />
        </div>
        
        <h2 className="text-5xl font-black text-gray-800 mb-4 tracking-tighter italic">Tuyệt vời!</h2>
        <p className="text-gray-500 text-lg mb-10 font-medium px-8 leading-relaxed">Đơn đặt phòng <span className="text-blue-600 font-black">#{room.room_number}</span> của bạn đã được xác nhận thành công.</p>
        
        {confirmedBooking?.access_code && (
          <div className="space-y-8 mb-10">
            <div className="bg-blue-600 p-8 rounded-[3rem] shadow-2xl shadow-blue-200 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
               <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.3em] mb-3">Mã mở khoá phòng</p>
               <div className="text-6xl font-black text-white tracking-[0.2em] drop-shadow-lg">
                 {confirmedBooking.access_code}
               </div>
            </div>

            <div className="bg-gray-50/50 backdrop-blur-md p-10 rounded-[3rem] border border-gray-100 flex flex-col items-center">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-6">Mã QR Check-in nhanh</p>
               <div className="p-6 bg-white rounded-[2.5rem] shadow-xl border border-gray-50">
                 <QRCodeCanvas 
                    value={JSON.stringify({ 
                      bookingId: confirmedBooking.id, 
                      code: confirmedBooking.access_code,
                      room: room.room_number 
                    })} 
                    size={180}
                    level="H"
                    includeMargin={true}
                 />
               </div>
               <p className="text-[10px] text-blue-400 mt-6 font-black uppercase tracking-widest flex items-center gap-2">
                 <Info size={12} /> Vuốt mã này trước cảm biến khoá
               </p>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
            <button 
                onClick={() => navigate('/')} 
                className="w-full bg-gray-900 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl shadow-gray-200 hover:bg-black transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
                Quay lại trang chủ
            </button>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-4">Cảm ơn bạn đã lựa chọn HOTELUX</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 relative">
      {/* Sidebar background effect */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 -z-10 blur-3xl" />
      
      <div className="max-w-6xl mx-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-16 gap-6">
           {[1, 2, 3].map(s => (
             <React.Fragment key={s}>
                <div className="relative group">
                    <div className={`w-14 h-14 rounded-[1.5rem] flex items-center justify-center font-black transition-all duration-500 relative z-10
                        ${currentStep === s 
                            ? 'bg-blue-600 text-white shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] scale-110 rotate-3' 
                            : currentStep > s 
                                ? 'bg-green-500 text-white' 
                                : 'bg-white text-gray-200 shadow-sm border border-gray-100'}`}>
                        {currentStep > s ? <CheckCircle size={24} /> : (
                            <span className="text-xl">0{s}</span>
                        )}
                    </div>
                    {currentStep === s && (
                        <div className="absolute inset-0 bg-blue-600 rounded-[1.5rem] blur-xl opacity-30 animate-pulse" />
                    )}
                </div>
                {s < 3 && (
                    <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className={`h-full transition-all duration-1000 ${currentStep > s ? 'w-full bg-green-500' : 'w-0 bg-blue-600'}`} />
                    </div>
                )}
             </React.Fragment>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Booking Controls */}
          <div className="lg:col-span-2 space-y-8">
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                 <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100">
                    <div className="flex justify-between items-start mb-10">
                        <div>
                            <h3 className="text-4xl font-black text-blue-900 tracking-tight">Cấu hình kỳ nghỉ</h3>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Tuỳ chỉnh thời gian nhận và trả phòng</p>
                        </div>
                        <div className="bg-blue-50 px-4 py-2 rounded-2xl text-blue-600 font-black text-xs uppercase tracking-widest">Bước 01</div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-4">Hình thức đặt</label>
                            <div className="flex bg-gray-50 p-2 rounded-[2rem] border border-gray-100 shadow-inner">
                                <button 
                                    onClick={() => setBookingType('hourly')}
                                    className={`flex-1 py-4 rounded-[1.5rem] font-black text-sm transition-all ${bookingType === 'hourly' ? 'bg-white text-blue-600 shadow-lg shadow-blue-50 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Theo giờ
                                </button>
                                <button 
                                    onClick={() => setBookingType('daily')}
                                    className={`flex-1 py-4 rounded-[1.5rem] font-black text-sm transition-all ${bookingType === 'daily' ? 'bg-white text-blue-600 shadow-lg shadow-blue-50 scale-105' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    Theo ngày
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-4">Giờ nhận phòng</label>
                            <div className="relative group">
                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 group-focus-within:scale-110 transition-transform" size={20} />
                                <input 
                                    type="datetime-local"
                                    value={checkIn}
                                    onChange={(e) => setCheckIn(e.target.value)}
                                    className="w-full bg-gray-50 pl-16 pr-8 py-5 rounded-[2rem] border-2 border-transparent font-black text-gray-700 outline-none focus:bg-white focus:border-blue-500/20 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                />
                            </div>
                        </div>
                    </div>
                    {bookingType === 'hourly' && (
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] pl-4">Thời lượng lưu trú</label>
                            <div className="grid grid-cols-5 gap-4">
                                {[1, 2, 3, 4, 6].map(h => (
                                    <button 
                                        key={h}
                                        onClick={() => setDuration(h)}
                                        className={`py-6 rounded-3xl font-black text-xl transition-all border-2 relative group overflow-hidden
                                        ${duration === h 
                                            ? 'bg-blue-600 border-blue-600 text-white shadow-2xl shadow-blue-100 scale-105' 
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-blue-200'}`}
                                    >
                                        {h}h
                                        {duration === h && (
                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                 </div>

                 <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-8">
                        <Clock className="text-blue-500" size={24} />
                        <h3 className="text-2xl font-black text-blue-900 tracking-tight">Biểu đồ trống</h3>
                    </div>
                    <BookingTimeline 
                        bookings={allBookings} 
                        currentRoomId={room.id} 
                        onSelectRange={handleSelectRange}
                    />
                 </div>
                 
                 <button 
                    onClick={nextStep}
                    className="w-full bg-blue-600 text-white py-8 rounded-[3rem] font-black text-2xl shadow-[0_24px_48px_-12px_rgba(37,99,235,0.3)] hover:bg-blue-700 transition-all hover:translate-y-[-4px] active:translate-y-0 group relative overflow-hidden"
                 >
                    <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
                    Tiếp theo: Xác minh danh tính
                 </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="bg-white p-16 rounded-[4rem] shadow-2xl border border-gray-100 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-[100px] opacity-40 -ml-32 -mt-32" />
                    
                    <div className="relative z-10">
                        <div className="bg-blue-600 w-24 h-24 rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-10 shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] rotate-6">
                            <Scan size={48} />
                        </div>
                        <h3 className="text-5xl font-black text-gray-800 mb-4 tracking-tighter">Xác minh danh tính</h3>
                        <p className="text-gray-400 text-lg mb-14 max-w-sm mx-auto font-medium leading-relaxed">Vui lòng quét <span className="text-blue-600 font-black">CCCD / CMND</span> để hoàn tất quy trình bảo mật tự động.</p>
                        
                        <div className="bg-gray-50/50 backdrop-blur-sm p-12 rounded-[4rem] border-4 border-dashed border-gray-100 relative group transition-all hover:bg-white hover:border-blue-400/30 mb-10 flex flex-col items-center justify-center overflow-hidden h-80 shadow-inner">
                            {!ocrFile ? (
                                <div className="text-center animate-in fade-in duration-500">
                                    <div className="bg-white p-6 rounded-[2rem] shadow-md mb-6 inline-block group-hover:scale-110 transition-transform">
                                        <UploadCloud className="text-blue-500" size={48} />
                                    </div>
                                    <p className="font-black text-gray-400 uppercase tracking-[0.2em] text-[10px]">Kéo thả hoặc Click để tải ảnh</p>
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer" 
                                        onChange={(e) => {
                                            setOcrFile(e.target.files[0]);
                                            setOcrRotation(0);
                                        }}
                                        accept="image/*"
                                     />
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center group/img">
                                    <img 
                                        src={URL.createObjectURL(ocrFile)} 
                                        className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl transition-all duration-500"
                                        style={{ transform: `rotate(${ocrRotation}deg)` }}
                                        alt="CCCD" 
                                    />
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 transition-opacity rounded-3xl flex items-center justify-center gap-6">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleOcrRotate(); }}
                                            className="bg-white text-blue-600 p-4 rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all"
                                        >
                                            <RefreshCw size={24} />
                                        </button>
                                        <button 
                                            onClick={() => setOcrFile(null)}
                                            className="bg-red-500 text-white p-4 rounded-3xl shadow-2xl hover:scale-110 active:scale-95 transition-all text-xs font-black uppercase tracking-widest"
                                        >
                                            Làm lại
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {ocrError && (
                            <div className="bg-red-50 text-red-500 p-4 rounded-2xl font-bold mb-8 flex items-center justify-center gap-2">
                                <Info size={16} />
                                {ocrError}
                            </div>
                        )}

                        <div className="flex gap-6">
                            <button onClick={() => setCurrentStep(1)} className="flex-1 py-6 rounded-[2rem] font-black text-gray-400 hover:bg-gray-100/50 hover:text-gray-600 transition-all uppercase tracking-widest text-xs">Quay lại</button>
                            <button 
                                onClick={handleOcrVerification}
                                disabled={!ocrFile || verifying}
                                className={`flex-[2] py-6 rounded-[2rem] font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-4 relative overflow-hidden group
                                ${!ocrFile || verifying ? 'bg-gray-200 text-gray-400' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 hover:translate-y-[-4px]'}`}
                            >
                                {verifying ? (
                                    <>
                                        <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                                        Đang nhận diện...
                                    </>
                                ) : (
                                    <>
                                        Quét & Xác minh
                                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                 </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in zoom-in duration-500">
                 <div className="bg-white p-12 rounded-[3.5rem] shadow-2xl border border-gray-100 relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32" />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-6 mb-12">
                            <div className="bg-green-500 p-4 rounded-3xl text-white shadow-lg shadow-green-100">
                                <ShieldCheck size={32} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-gray-800 tracking-tight">Xác nhận thanh toán</h3>
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Hệ thống thanh toán bảo mật 256-bit SSL</p>
                            </div>
                        </div>

                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 block pl-2">Phương thức thanh toán</label>
                        <div className="grid md:grid-cols-2 gap-6 mb-10">
                            {[
                                { id: 'vnpay', name: 'VNPAY / Quốc tế', icon: CreditCard, color: 'bg-blue-600', sub: 'Thẻ ATM, Visa, Master, JCB' },
                                { id: 'transfer', name: 'Chuyển khoản QR', icon: QrCode, color: 'bg-indigo-600', sub: 'Quét mã qua App Ngân hàng' }
                            ].map((method) => (
                                <div 
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`relative p-8 rounded-[2.5rem] transition-all cursor-pointer border-2 overflow-hidden group
                                    ${paymentMethod === method.id 
                                        ? 'border-blue-600 bg-blue-50/30 shadow-xl shadow-blue-50' 
                                        : 'border-gray-100 bg-white hover:border-blue-200'}`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${paymentMethod === method.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        <method.icon size={24} />
                                    </div>
                                    <p className={`font-black text-xl mb-1 ${paymentMethod === method.id ? 'text-blue-900' : 'text-gray-800'}`}>{method.name}</p>
                                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{method.sub}</p>
                                    
                                    {paymentMethod === method.id && (
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-blue-600 text-white p-1 rounded-full">
                                                <CheckCircle size={14} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="bg-gray-50/50 backdrop-blur-sm p-10 rounded-[3rem] border border-gray-100 relative group transition-all hover:bg-white shadow-inner">
                            <div className="absolute top-6 right-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] group-hover:text-blue-200 transition-colors">Hóa đơn chi tiết</div>
                            
                            <div className="space-y-5">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-bold flex items-center gap-2">
                                        <Clock size={16} className="text-blue-400" /> Tổng thời gian
                                    </span>
                                    <span className="text-gray-800 font-black text-lg">{bookingType === 'hourly' ? `${duration} giờ` : '1 ngày'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-bold flex items-center gap-2">
                                        Giá tạm tính
                                    </span>
                                    <span className="text-gray-800 font-black text-lg">{formatVND(bookingType === 'hourly' ? room.price_per_hour * duration : room.price_per_day)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-bold flex items-center gap-2">
                                        <Info size={16} className="text-blue-400" /> Giảm giá
                                    </span>
                                    <span className="text-green-500 font-black">-$0.00</span>
                                </div>
                                <div className="flex justify-between items-center pb-6 border-b border-dashed border-gray-200">
                                    <span className="text-gray-400 font-bold flex items-center gap-2">
                                        <CreditCard size={16} className="text-blue-400" /> Phí dịch vụ
                                    </span>
                                    <span className="text-gray-800 font-black">0₫</span>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <div>
                                        <span className="text-2xl font-black text-blue-900 tracking-tighter">Tổng tiền</span>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Đã bao gồm thuế GTGT</p>
                                    </div>
                                    <span className="text-5xl font-black text-blue-600 tracking-tighter flex items-start">
                                        {formatVND(bookingType === 'hourly' ? room.price_per_hour * duration : room.price_per_day)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex flex-col items-center gap-6">
                            <button 
                                onClick={handleBooking}
                                disabled={verifying}
                                className="w-full relative group"
                            >
                                <div className="absolute inset-0 bg-blue-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-6 rounded-[2.5rem] font-black text-2xl shadow-xl shadow-blue-100 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4">
                                    {verifying ? (
                                        <>
                                            <RefreshCw className="animate-spin" />
                                            Đang xác nhận...
                                        </>
                                    ) : (
                                        <>
                                            Thanh toán & Đặt ngay
                                            <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </div>
                            </button>
                            
                            <div className="flex items-center gap-3 text-gray-300">
                                <div className="w-12 h-px bg-gray-100" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Demo Mode Active</p>
                                <div className="w-12 h-px bg-gray-100" />
                            </div>
                            
                            <p className="text-center text-[10px] text-gray-400 font-bold italic max-w-xs leading-relaxed opacity-70">
                                Nhấn nút xác nhận sẽ giả lập giao dịch thành công. 
                                Hệ thống của chúng tôi không lưu thông tin thanh toán của bạn.
                            </p>
                        </div>
                    </div>
                 </div>
              </div>
            )}
          </div>

          {/* Sidebar Summary */}
          <div className="space-y-8 sticky top-24 h-fit">
            <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-gray-100 group animate-in slide-in-from-bottom-8 duration-700">
                <div className="h-72 overflow-hidden relative">
                    <img 
                        src={meta.image} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        alt="Room" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <div className="absolute top-8 left-8 flex gap-2">
                        <span className="bg-blue-600 backdrop-blur-md text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40">{room.room_type}</span>
                    </div>
                    <div className="absolute bottom-6 left-8">
                         <h4 className="text-3xl font-black text-white tracking-tighter capitalize">Phòng {room.room_number}</h4>
                    </div>
                </div>
                <div className="p-10">
                    <div className="space-y-6 mb-10">
                        <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Giá cơ bản</span>
                            <span className="font-black text-gray-800 text-lg">{formatVND(bookingType === 'hourly' ? room.price_per_hour : room.price_per_day)}</span>
                        </div>
                        <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Kỳ lưu trú</span>
                            <span className="font-black text-gray-800 text-lg capitalize">{bookingType === 'hourly' ? `${duration} giờ` : '1 ngày'}</span>
                        </div>
                        <div className="pt-4 flex justify-between items-center">
                            <div>
                                <span className="text-xl font-black text-blue-900 tracking-tighter">Thanh toán</span>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ước tính</p>
                            </div>
                            <span className="text-5xl font-black text-blue-600 tracking-tighter flex items-start">
                                {formatVND(bookingType === 'hourly' ? room.price_per_hour * duration : room.price_per_day)}
                            </span>
                        </div>
                    </div>

                    <div className="bg-blue-50/50 backdrop-blur-sm p-6 rounded-[2rem] border border-blue-100/50 flex gap-4 items-center">
                        <div className="bg-white p-3 rounded-2xl text-blue-600 shadow-sm">
                            <ShieldCheck size={20} />
                        </div>
                        <p className="text-[10px] text-blue-900/60 font-black uppercase tracking-wide leading-relaxed">Đảm bảo giá tốt nhất & dịch vụ cao cấp 5 sao</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
