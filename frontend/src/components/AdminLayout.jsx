import React from 'react';
import { 
  BarChart3, 
  Users, 
  BedDouble, 
  CheckSquare, 
  Settings,
  LogOut,
  Calendar,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { id: 'overview', label: 'Tổng quan', icon: BarChart3, path: '/admin' },
    { id: 'bookings', label: 'Đơn đặt phòng', icon: Calendar, path: '/admin/bookings' },
    { id: 'housekeeping', label: 'Dọn dẹp', icon: CheckSquare, path: '/admin/housekeeping' },
    { id: 'members', label: 'Thành viên', icon: Users, path: '/admin/members' },
    { id: 'reports', label: 'Báo cáo', icon: FileText, path: '/admin/reports' },
    { id: 'settings', label: 'Cài đặt', icon: Settings, path: '/admin/settings' },
  ];

  const SidebarItem = ({ icon: Icon, label, path }) => {
    const isActive = location.pathname === path || (path === '/admin' && location.pathname === '/admin/');
    return (
      <button 
        onClick={() => navigate(path)}
        className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-gray-400 hover:bg-gray-50'}`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <aside className="w-80 bg-white border-r border-gray-100 p-8 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="flex items-center gap-2 mb-12">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BedDouble className="text-white" size={24} />
          </div>
          <span className="text-2xl font-black text-blue-900 tracking-tighter">ADMIN<span className="text-blue-500">PRO</span></span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <SidebarItem key={item.id} {...item} />
          ))}
        </nav>

        <button onClick={logout} className="mt-auto flex items-center gap-4 px-6 py-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all">
          <LogOut size={20} />
          <span>Đăng xuất</span>
        </button>
      </aside>

      {/* Main Content Area - with offset for fixed sidebar */}
      <main className="flex-1 ml-80 p-12 min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
