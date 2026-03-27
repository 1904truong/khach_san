import React from 'react';
import { Menu, Hotel, User, LogIn } from 'lucide-react';

const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <Hotel className="w-8 h-8 text-indigo-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                LuxStay & Hotel
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
              <a href="/" className="hover:text-indigo-600 transition-colors">Trang chủ</a>
              <a href="/rooms" className="hover:text-indigo-600 transition-colors">Phòng nghỉ</a>
              <a href="/services" className="hover:text-indigo-600 transition-colors">Dịch vụ</a>
              <a href="/about" className="hover:text-indigo-600 transition-colors">Về chúng tôi</a>
            </div>

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
              <button className="md:hidden p-2 text-slate-600">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main>
        {children}
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">© 2026 LuxStay & Hotel. Môi trường phát triển cho yêu cầu dự án.</p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
