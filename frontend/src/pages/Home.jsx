import React from 'react';
import { Link } from 'react-router-dom';
import { Hotel, MapPin, Calendar, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user, logout } = useAuth();

  return (
    <div className="relative min-h-screen bg-white overflow-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Hotel className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black text-blue-900 tracking-tighter">LUXE<span className="text-blue-500">STAY</span></span>
            </div>
            <div className="hidden md:flex space-x-8 font-medium text-gray-600">
              <Link to="/" className="hover:text-blue-600">Trang chủ</Link>
              <Link to="/rooms" className="hover:text-blue-600">Phòng</Link>
              {user?.role === 'admin' && <Link to="/admin" className="hover:text-blue-600">Quản trị</Link>}
            </div>
            <div className="flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <User size={18} className="text-blue-600" />
                    <span className="text-sm font-semibold text-gray-700">{user.username}</span>
                  </div>
                  <Link to="/profile" className="text-sm font-bold text-gray-400 hover:text-blue-600 transition-all">Hồ sơ</Link>
                  <button onClick={logout} className="text-sm font-bold text-red-500 hover:text-red-700">Thoát</button>
                </div>
              ) : (
                <Link to="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                  Đăng nhập
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold animate-bounce">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Đang mở đặt phòng cho năm 2026
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-blue-900 leading-[1.1] tracking-tight">
              Trải nghiệm <br />
              <span className="text-blue-600">kỳ nghỉ</span><br />
              tuyệt vời.
            </h1>
            <p className="text-xl text-gray-500 max-w-lg leading-relaxed">
              Đặt các homestay và khách sạn tốt nhất với hệ thống đặt phòng theo giờ hiện đại của chúng tôi. Dịch vụ cao cấp, đảm bảo sự thoải mái và truy cập tức thì.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to="/rooms" className="flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 group">
                Khám phá ngay
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              {user && (
                  <Link to="/verify-id" className="flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-100 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-50 transition-all">
                    Xác minh danh tính
                  </Link>
              )}
            </div>

            {/* Workflow Steps */}
            <div className="grid grid-cols-3 gap-4 pt-12 border-t border-gray-100 mt-12">
                <div className="space-y-2">
                    <p className="text-xl font-black text-blue-900 leading-none">01</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Đặt phòng</p>
                </div>
                <div className="space-y-2">
                    <p className="text-xl font-black text-blue-900 leading-none">02</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Xác minh</p>
                </div>
                <div className="space-y-2">
                    <p className="text-xl font-black text-blue-900 leading-none">03</p>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Nhận mã</p>
                </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1000" 
                alt="Luxury Room" 
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute bottom-6 left-6 right-6 bg-white/20 backdrop-blur-xl p-6 rounded-2xl border border-white/30">
                <div className="flex justify-between items-center text-white">
                  <div>
                    <h3 className="font-bold text-xl">Luxe Suite 302</h3>
                    <p className="text-sm opacity-90">Trung tâm Thành phố</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black">450.000₫<span className="text-sm font-normal">/giờ</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
