import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Rooms from './pages/Rooms';
import Booking from './pages/Booking';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminBookings from './pages/Admin/Bookings';
import AdminMembers from './pages/Admin/Members';
import AdminHousekeeping from './pages/Admin/Housekeeping';
import AdminReports from './pages/Admin/Reports';
import MyBookings from './pages/MyBookings';
import RoomDetail from './pages/RoomDetail';
import VerifyID from './pages/VerifyID';
import Profile from './pages/Profile';
import AdminLayout from './components/AdminLayout';
import { useAuth } from './context/AuthContext';
import { Home as HomeIcon, Bed, Calendar, User as UserIcon, LogOut, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  
  if (user?.role === 'admin') return null; // Admin has its own sidebar

  return (
    <nav className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 flex items-center justify-between px-8 shadow-sm">
      <Link to="/" className="flex items-center gap-2">
        <div className="bg-blue-600 p-1.5 rounded-lg">
          <Bed className="text-white" size={20} />
        </div>
        <span className="text-xl font-black text-blue-900 tracking-tighter">HOTEL<span className="text-blue-500">UX</span></span>
      </Link>
      
      <div className="flex items-center gap-8">
        <Link to="/" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-all flex items-center gap-2">
           <HomeIcon size={18} /> Trang chủ
        </Link>
        <Link to="/rooms" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-all flex items-center gap-2">
           <Bed size={18} /> Phòng
        </Link>
        {user ? (
          <>
            <Link to="/my-bookings" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-all flex items-center gap-2">
               <Calendar size={18} /> Đơn đặt
            </Link>
            <Link to="/verify-id" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-all flex items-center gap-2">
               <ShieldCheck size={18} /> Xác minh
            </Link>
            <div className="flex items-center gap-4 ml-4 pl-8 border-l border-gray-100">
               <div className="text-right hidden sm:block">
                  <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none">Khách hàng</p>
                  <p className="text-sm font-bold text-gray-800">{user.username}</p>
               </div>
                <Link to="/profile" className="p-2 transition-all hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-xl group relative">
                   <UserIcon size={20} />
                   <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">Hồ sơ</span>
                </Link>
                <button onClick={logout} className="p-2 transition-all hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl relative group">
                   <LogOut size={20} />
                   <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[8px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap">Thoát</span>
                </button>
             </div>
          </>
        ) : (
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
};

const App = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen text-2xl font-bold">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/room/:roomId" element={<RoomDetail />} />
        <Route path="/booking/:roomId" element={<Booking />} />
        <Route 
          path="/my-bookings" 
          element={user ? <MyBookings /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/verify-id" 
          element={user ? <VerifyID /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={user ? <Profile /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin/*" 
          element={user?.role === 'admin' ? (
            <AdminLayout>
              <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="members" element={<AdminMembers />} />
                <Route path="housekeeping" element={<AdminHousekeeping />} />
                <Route path="reports" element={<AdminReports />} />
              </Routes>
            </AdminLayout>
          ) : <Navigate to="/login" />} 
        />
      </Routes>
    </div>
  );
};

export default App;
