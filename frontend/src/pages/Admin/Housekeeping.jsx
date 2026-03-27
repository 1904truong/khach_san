import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Star } from 'lucide-react';
import { roomService, housekeepingService } from '../../services/api';

const Housekeeping = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await roomService.getRooms();
        setRooms(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };
    fetchRooms();
  }, []);

  const handleUpdateStatus = async (roomId, status) => {
    try {
      await housekeepingService.updateStatus({ room_id: roomId, status });
      setRooms(rooms.map(r => r.id === roomId ? { ...r, housekeeping_status: status } : r));
    } catch (error) {
      alert("Failed to update status");
    }
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý dọn dẹp</h1>
        <p className="text-gray-500 mt-1">Theo dõi và cập nhật trạng thái vệ sinh và bảo trì phòng.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 font-mono">Phòng {room.room_number}</h3>
                <p className="text-sm text-gray-500 uppercase tracking-wider">{room.room_type}</p>
              </div>
              <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase
                ${room.housekeeping_status === 'cleaned' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {room.housekeeping_status === 'cleaned' ? 'Đã dọn' : 'Chưa dọn'}
              </span>
            </div>

            <div className="space-y-3 mt-6">
              <button 
                onClick={() => handleUpdateStatus(room.id, 'cleaned')}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all
                  ${room.housekeeping_status === 'cleaned' ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600'}`}
              >
                <CheckCircle size={16} /> Đánh dấu đã dọn
              </button>
              <button 
                onClick={() => handleUpdateStatus(room.id, 'dirty')}
                className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-all
                  ${room.housekeeping_status === 'dirty' ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'}`}
              >
                <RefreshCw size={16} /> Đánh dấu chưa dọn
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Housekeeping;
