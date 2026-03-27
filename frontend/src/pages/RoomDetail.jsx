import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { roomService, bookingService } from '../services/api';
import { 
  Wifi, 
  Wind, 
  Coffee, 
  Star, 
  Users, 
  Maximize, 
  ShieldCheck, 
  Clock, 
  ParkingCircle,
  Tv,
  Utensils,
  Bed,
  Bath
} from 'lucide-react';
import BookingTimeline from '../components/BookingTimeline';
import { formatVND } from '../utils/format';

const RoomDetail = () => {
  const { roomId } = useParams();
  const [room, setRoom] = useState(null);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  const images = [
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1200",
    "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=1200"
  ];

  const amenities = [
    { icon: Wifi, label: "WiFi Tốc độ cao", desc: "Kết nối ổn định 24/7" },
    { icon: Wind, label: "Điều hòa nhiệt độ", desc: "Điều chỉnh thông minh" },
    { icon: Coffee, label: "Bữa sáng miễn phí", desc: "Phục vụ tại phòng" },
    { icon: Tv, label: "Smart TV 4K", desc: "Netflix & Youtube sẵn có" },
    { icon: Utensils, label: "Mini Bar", desc: "Đồ uống đa dạng" },
    { icon: ShieldCheck, label: "Khóa thông minh", desc: "An toàn tuyệt đối" }
  ];

  const getRoomMeta = (room) => {
    const id = room.id;
    const type = room.room_type.toLowerCase();
    const images = [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b'
    ];
    let beds = '01', baths = '01', area = '35m²';
    if (type.includes('deluxe')) { beds = '02'; baths = '01'; area = '55m²'; }
    else if (type.includes('suite')) { beds = '02'; baths = '02'; area = '85m²'; }
    else if (type.includes('villa')) { beds = '04'; baths = '04'; area = '450m²'; }
    return {
      image: `${images[id % images.length]}?auto=format&fit=crop&q=80&w=1200`,
      beds,
      baths,
      area
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const roomRes = await roomService.getRooms();
        const found = roomRes.data.find(r => r.id === parseInt(roomId));
        setRoom(found);

        const bookingsRes = await bookingService.getAllBookings();
        setAllBookings(bookingsRes.data);
      } catch (err) {
        console.error("Error fetching room details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [roomId]);

  if (loading || !room) return <div className="p-20 text-center font-bold">Đang tải thông tin phòng...</div>;

  const meta = getRoomMeta(room);
  const displayImages = [meta.image, images[1], images[2]];

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Gallery Section */}
          <div className="space-y-4">
            <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
               <img src={displayImages[activeImg]} className="w-full h-full object-cover" alt="Main" />
               <div className="absolute top-6 left-6 flex gap-2">
                  <span className="bg-blue-600/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{room.room_type}</span>
                  <span className="bg-green-500/90 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Sẵn sàng</span>
               </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
               {displayImages.map((img, idx) => (
                 <button 
                    key={idx} 
                    onClick={() => setActiveImg(idx)}
                    className={`h-32 rounded-3xl overflow-hidden border-4 transition-all ${activeImg === idx ? 'border-blue-500' : 'border-white hover:border-blue-200'}`}
                 >
                    <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} />
                 </button>
               ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h1 className="text-5xl font-black text-gray-800 tracking-tighter mb-2">Phòng {room.room_number}</h1>
                  <div className="flex items-center gap-2 text-yellow-500">
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <Star size={18} fill="currentColor" />
                    <span className="text-gray-400 font-bold ml-2">(48 đánh giá)</span>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">Giá theo ngày</p>
                  <p className="text-4xl font-black text-blue-600">{formatVND(room.price_per_day)}<span className="text-lg text-gray-400 font-bold">/ngày</span></p>
                  <p className="text-sm font-bold text-gray-400 mt-1">Hoặc {formatVND(room.price_per_hour)}/giờ</p>
               </div>
            </div>

            <p className="text-gray-500 text-lg leading-relaxed mb-10 font-medium capitalize">
               {room.room_type} Serenity Heights - Trải nghiệm sự sang trọng và tiện nghi đẳng cấp tại trung tâm thành phố. Căn phòng được thiết kế tối giản nhưng vẫn đầy đủ trang thiết bị hiện đại.
            </p>

            <div className="grid grid-cols-2 gap-6 mb-12">
               <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
                  <Maximize className="text-blue-500" size={32} />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Diện tích</p>
                    <p className="font-black text-gray-800 text-xl">{meta.area}</p>
                  </div>
               </div>
               <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4 shadow-sm">
                  <Bed className="text-blue-500" size={32} />
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Phòng ngủ</p>
                    <p className="font-black text-gray-800 text-xl">{meta.beds} Beds</p>
                  </div>
               </div>
            </div>

            <div className="mt-auto">
               <Link 
                to={`/booking/${room.id}`}
                className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all text-center block"
               >
                 Đặt phòng ngay bây giờ
               </Link>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mt-20">
           <h3 className="text-3xl font-black text-blue-900 mb-8 tracking-tight">Tính khả dụng theo thời gian</h3>
           <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-100">
             <BookingTimeline 
                bookings={allBookings} 
                currentRoomId={room.id} 
                onSelectRange={() => {}}
             />
           </div>
        </div>

        {/* Amenities Grid */}
        <div className="mt-20">
           <h3 className="text-3xl font-black text-blue-900 mb-8 tracking-tight">Tiện ích đi kèm</h3>
           <div className="grid md:grid-cols-3 gap-8">
              {amenities.map((item, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex gap-6 hover:shadow-xl transition-all group">
                   <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <item.icon size={28} />
                   </div>
                   <div>
                      <h4 className="font-black text-gray-800 text-lg mb-1">{item.label}</h4>
                      <p className="text-gray-400 font-medium text-sm">{item.desc}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetail;
