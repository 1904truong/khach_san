import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { roomService } from '../services/api';
import { Bed, Bath, Maximize, MapPin, Building2, Heart, Star, ChevronRight } from 'lucide-react';
import { formatVND } from '../utils/format';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['Featured', 'Apartments', 'Villa', 'Office Space', 'Bungalow'];

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await roomService.getRooms();
        setRooms(res.data);
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchRooms();
  }, []);

  const getRoomMeta = (room) => {
    const id = room.id;
    const type = room.room_type.toLowerCase();
    
    // Dynamic Images based on ID and type
    const images = [
      'https://images.unsplash.com/photo-1613977257363-707ba9348227',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750',
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
      'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b'
    ];
    
    const locations = [
        'District 1 • Ho Chi Minh City',
        'Thao Dien • District 2',
        'Phu My Hung • District 7',
        'Cau Giay • Hanoi',
        'Son Tra • Da Nang'
    ];

    const buildings = [
        'Dugasta Property • LUXESTAY',
        'Serenity Suites • PREMIER',
        'Skyline Garden • RESIDENCE',
        'The Landmark • EXCLUSIVE',
        'Rivergate • LUXURY'
    ];

    // Logic for specs based on type
    let beds = '01', baths = '01', area = '35m²';
    if (type.includes('deluxe')) { beds = '02'; baths = '01'; area = '55m²'; }
    else if (type.includes('suite')) { beds = '02'; baths = '02'; area = '85m²'; }
    else if (type.includes('villa')) { beds = '04'; baths = '04'; area = '450m²'; }
    
    return {
      image: `${images[id % images.length]}?auto=format&fit=crop&q=80&w=800`,
      location: locations[id % locations.length],
      building: buildings[id % buildings.length],
      beds,
      baths,
      area,
      daysAgo: (id % 10) + 1
    };
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-bold text-gray-400 animate-pulse">Đang tìm phòng tốt nhất cho bạn...</p>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f8fbff] min-h-screen pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-5xl font-black text-gray-900 tracking-tight">Khám phá không gian nghỉ dưỡng</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto font-medium">
            Mỗi căn phòng là một trải nghiệm độc bản, được thiết kế để mang lại sự thoải mái tối đa.
          </p>
        </div>

        {/* Pill Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-16">
          <button 
            onClick={() => setActiveFilter('All')}
            className={`px-8 py-2.5 rounded-full font-bold transition-all border ${activeFilter === 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200' : 'bg-white text-blue-500 border-blue-100 hover:border-blue-400'}`}
          >
            Tất cả
          </button>
          {filters.map(filter => (
            <button 
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-2.5 rounded-full font-bold transition-all border ${activeFilter === filter ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200' : 'bg-white text-blue-500 border-blue-100 hover:border-blue-400'}`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Rooms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {rooms.map((room) => {
            const meta = getRoomMeta(room);
            return (
              <Link key={room.id} to={`/room/${room.id}`} className="group block">
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/5 hover:shadow-blue-900/10 transition-all duration-500 border border-white">
                  {/* Image Container */}
                  <div className="relative h-[280px] m-3 rounded-[2rem] overflow-hidden shadow-inner">
                    <img 
                      src={meta.image} 
                      alt={room.room_number}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {/* Heart Icon */}
                    <button className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-all border border-white/30">
                      <Heart size={20} />
                    </button>
                    {/* Time Badge */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-xs font-black text-gray-700 shadow-sm border border-white/50 lowercase tracking-tight">
                      {meta.daysAgo} {meta.daysAgo === 1 ? 'day' : 'days'} ago
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 pt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-xl font-black text-gray-800 tracking-tight group-hover:text-blue-600 transition-colors capitalize">{room.room_type} {room.room_number}</h3>
                      <p className="text-xl font-black text-blue-600">{formatVND(room.price_per_day)}</p>
                    </div>

                    <div className="space-y-2 mb-8">
                      <div className="flex items-center gap-2 text-gray-400 font-medium text-sm capitalize">
                        <Building2 size={16} className="text-blue-500/50" />
                        {meta.building}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400 font-medium text-sm capitalize">
                        <MapPin size={16} className="text-blue-500/50" />
                        {meta.location}
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-3 gap-4 border-t border-gray-50 pt-6 mt-4">
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="bg-gray-50 p-1.5 rounded-lg"><Bed size={16} /></div>
                        <span className="text-xs font-black">{meta.beds}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="bg-gray-50 p-1.5 rounded-lg"><Bath size={16} /></div>
                        <span className="text-xs font-black">{meta.baths}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <div className="bg-gray-50 p-1.5 rounded-lg"><Maximize size={16} /></div>
                        <span className="text-xs font-black">{meta.area}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View More Button */}
        <div className="mt-20 text-center">
            <button className="bg-blue-600 text-white px-12 py-4 rounded-[1.2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:-translate-y-1">
                View More
            </button>
        </div>
      </div>
    </div>
  );
};

export default Rooms;
