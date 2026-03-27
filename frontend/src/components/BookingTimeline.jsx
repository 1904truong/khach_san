import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'vi': vi,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BookingTimeline = ({ bookings, currentRoomId, onSelectRange }) => {
  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const roomBookings = safeBookings.filter(b => b.room_id === currentRoomId);
  
  const events = roomBookings.map(b => ({
    id: b.id,
    title: 'Đã đặt',
    start: new Date(b.check_in),
    end: new Date(b.check_out),
    resource: b
  }));

  const handleSelectSlot = ({ start, end }) => {
    // Prevent selecting back in time
    if (start < new Date()) {
      alert('Không thể chọn thời gian trong quá khứ');
      return;
    }

    // Check for overlap with existing bookings
    const overlap = roomBookings.some(b => {
      const bStart = new Date(b.check_in);
      const bEnd = new Date(b.check_out);
      return (start < bEnd && end > bStart);
    });

    if (overlap) {
      alert('Khung giờ này đã có người đặt. Vui lòng chọn khung giờ khác.');
      return;
    }

    if (onSelectRange) {
      onSelectRange(start, end);
    }
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: '#ef4444',
        borderRadius: '8px',
        opacity: 0.8,
        color: 'white',
        border: 'none',
        display: 'block',
        fontSize: '10px',
        fontWeight: 'bold',
        padding: '2px 6px'
      }
    };
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-gray-100 mt-8 group transition-all hover:shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-800 tracking-tight">Lịch phòng trực quan</h3>
          <p className="text-sm text-gray-400 font-medium">Kéo chuột để chọn khung giờ đặt phòng</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase tracking-[0.2em]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-200 rounded-sm"></div>
            <span className="text-gray-400">Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
            <span className="text-gray-400">Đã đặt</span>
          </div>
        </div>
      </div>

      <div className="h-[500px] calendar-premium">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="day"
          views={['day', 'week']}
          step={30}
          timeslots={2}
          selectable
          onSelectSlot={handleSelectSlot}
          eventPropGetter={eventStyleGetter}
          culture="vi"
          messages={{
            today: 'Hôm nay',
            previous: 'Trước',
            next: 'Sau',
            month: 'Tháng',
            week: 'Tuần',
            day: 'Ngày',
            agenda: 'Lịch biểu',
            noEventsInRange: 'Không có lịch đặt phòng',
          }}
          className="rounded-2xl overflow-hidden font-sans border-none"
        />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .rbc-calendar { font-family: inherit; border: none; }
        .rbc-header { padding: 12px; font-weight: 800; border-bottom: 2px solid #f1f5f9; color: #64748b; font-size: 12px; text-transform: uppercase; }
        .rbc-time-view { border: 1px solid #f1f5f9; border-radius: 20px; overflow: hidden; background: #fff; }
        .rbc-timeslot-group { border-bottom: 1px solid #f8fafc; min-height: 60px; }
        .rbc-time-slot { border-top: none; }
        .rbc-today { background-color: transparent !important; }
        .rbc-current-time-indicator { background-color: #2563eb; height: 2px; }
        .rbc-current-time-indicator::before { border-left: 10px solid #2563eb; }
        .rbc-time-content { border-top: 2px solid #f1f5f9; }
        .rbc-label { font-size: 11px; font-weight: 700; color: #94a3b8; padding-right: 10px; }
        .rbc-selected-cell { background-color: #dbeafe !important; }
        .rbc-toolbar { margin-bottom: 20px; border-bottom: none; }
        .rbc-toolbar button { border: 1px solid #f1f5f9; border-radius: 12px; padding: 8px 16px; font-weight: 700; font-size: 14px; color: #64748b; transition: all 0.2s; }
        .rbc-toolbar button:hover { background: #f8fafc; color: #2563eb; border-color: #2563eb; }
        .rbc-toolbar button.rbc-active { background: #2563eb !important; color: #fff !important; border-color: #2563eb !important; box-shadow: 0 10px 15px -3px rgb(37 99 235 / 0.2); }
      `}} />
    </div>
  );
};

export default BookingTimeline;
