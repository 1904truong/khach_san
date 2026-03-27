import React, { useState, useEffect } from 'react';
import { userService } from '../services/api';
import { User, Mail, Shield, ShieldCheck, ShieldAlert, Key, Edit3, Save, TrendingUp, CreditCard, Calendar, ChevronRight } from 'lucide-react';
import { formatVND } from '../utils/format';

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await userService.getProfile();
      setProfile(res.data);
      setFormData({ username: res.data.user.username, email: res.data.user.email });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await userService.updateProfile(formData);
      setMsg({ type: 'success', text: 'Cập nhật thông tin thành công!' });
      setEditing(false);
      fetchProfile();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Cập nhật thất bại' });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMsg({ type: 'error', text: 'Mật khẩu xác nhận không khớp' });
    }
    try {
      await userService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      setMsg({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Đổi mật khẩu thất bại' });
    }
  };

  if (loading) return <div className="p-20 text-center font-bold">Đang tải hồ sơ...</div>;

  const isVerified = !!profile.user.CustomerId;

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Abstract Background */}
      <div className="absolute top-0 right-0 w-1/3 h-1/2 bg-blue-600/5 -z-10 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-indigo-600/5 -z-10 blur-3xl rounded-full" />

      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
                <h1 className="text-5xl font-black text-gray-800 tracking-tighter">Hồ sơ cá nhân</h1>
                {isVerified ? (
                    <div className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-green-200">
                        <ShieldCheck size={14} /> Đã xác minh
                    </div>
                ) : (
                    <div className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-orange-200">
                        <ShieldAlert size={14} /> Chưa xác minh
                    </div>
                )}
            </div>
            <p className="text-gray-400 font-medium text-lg">Quản lý danh tính và xem lại hành trình của bạn tại HOTELUX</p>
          </div>
        </header>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-2">
            {[
              { id: 'overview', label: 'Tổng quan', icon: TrendingUp },
              { id: 'info', label: 'Thông tin cá nhân', icon: User },
              { id: 'security', label: 'Bảo mật', icon: Shield }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setMsg({ type: '', text: '' }); }}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-200' : 'text-gray-400 hover:bg-white hover:text-gray-600 shadow-sm'}`}
              >
                <tab.icon size={20} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
             {msg.text && (
                <div className={`mb-6 p-4 rounded-2xl font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${msg.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {msg.type === 'success' ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                    {msg.text}
                </div>
             )}

             {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all">
                            <div className="absolute -right-4 -bottom-4 text-blue-50 opacity-10 group-hover:scale-110 transition-transform">
                                <Calendar size={120} />
                            </div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-1">Tổng lượt ở</p>
                            <h3 className="text-4xl font-black text-gray-800">{profile.stats.totalBookings}</h3>
                            <p className="text-xs text-blue-500 font-bold mt-2">Dựa trên lịch sử đặt</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all">
                            <div className="absolute -right-4 -bottom-4 text-green-50 opacity-10 group-hover:scale-110 transition-transform">
                                <CreditCard size={120} />
                            </div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-1">Tổng chi tiêu</p>
                            <h3 className="text-4xl font-black text-gray-800">{formatVND(profile.stats.totalSpent)}</h3>
                            <p className="text-xs text-green-500 font-bold mt-2">Đã bao gồm VAT</p>
                        </div>
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all">
                            <div className="absolute -right-4 -bottom-4 text-indigo-50 opacity-10 group-hover:scale-110 transition-transform">
                                <ShieldCheck size={120} />
                            </div>
                            <p className="text-gray-400 font-black uppercase tracking-widest text-[10px] mb-1">Thành công</p>
                            <h3 className="text-4xl font-black text-gray-800">{profile.stats.confirmedBookings}</h3>
                            <p className="text-xs text-indigo-500 font-bold mt-2">Lượt ở hoàn tất</p>
                        </div>
                    </div>

                    <div className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-gray-100">
                        <h3 className="text-2xl font-black text-gray-800 mb-8 flex items-center gap-3">
                            <User className="text-blue-600" /> Tóm tắt danh tính
                        </h3>
                        <div className="grid md:grid-cols-2 gap-10">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Họ tên trên CCCD</p>
                                <p className="text-xl font-bold text-gray-800">{profile.user.CustomerId?.full_name || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Số CCCD / CMND</p>
                                <p className="text-xl font-bold text-gray-800 text-blue-600 tracking-widest">
                                    {profile.user.CustomerId?.id_number ? '•••• •••• ' + profile.user.CustomerId.id_number.slice(-4) : 'Chưa xác minh'}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ngày sinh</p>
                                <p className="text-xl font-bold text-gray-800">{profile.user.CustomerId?.dob || 'Chưa cập nhật'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email liên lạc</p>
                                <p className="text-xl font-bold text-gray-800">{profile.user.email}</p>
                            </div>
                        </div>
                        {!isVerified && (
                           <button className="mt-10 flex items-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:gap-4 transition-all">
                               Xác minh CCCD ngay để nhận ưu đãi <ChevronRight size={16} />
                           </button>
                        )}
                    </div>
                </div>
             )}

             {activeTab === 'info' && (
                <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="text-2xl font-black text-gray-800">Chỉnh sửa hồ sơ</h3>
                        {!editing ? (
                            <button onClick={() => setEditing(true)} className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all text-sm">
                                <Edit3 size={16} /> Chỉnh sửa
                            </button>
                        ) : (
                            <button onClick={() => { setEditing(false); fetchProfile(); }} className="text-gray-400 font-bold text-sm hover:text-gray-600">Hủy</button>
                        )}
                    </div>

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Tên người dùng</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input 
                                    type="text"
                                    disabled={!editing}
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="w-full bg-gray-50 pl-16 pr-8 py-5 rounded-[2rem] border-2 border-transparent font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500/20 disabled:opacity-50 transition-all"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Địa chỉ Email</label>
                            <div className="relative">
                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input 
                                    type="email"
                                    disabled={!editing}
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full bg-gray-50 pl-16 pr-8 py-5 rounded-[2rem] border-2 border-transparent font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500/20 disabled:opacity-50 transition-all"
                                />
                            </div>
                        </div>
                        {editing && (
                            <button type="submit" className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-3">
                                <Save size={24} /> Lưu thay đổi
                            </button>
                        )}
                    </form>
                </div>
             )}

             {activeTab === 'security' && (
                <div className="bg-white p-12 rounded-[3.5rem] shadow-xl border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-500">
                    <h3 className="text-2xl font-black text-gray-800 mb-10">Thay đổi mật khẩu</h3>
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Mật khẩu hiện tại</label>
                            <div className="relative">
                                <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input 
                                    type="password"
                                    required
                                    value={passwordData.oldPassword}
                                    onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                                    className="w-full bg-gray-50 pl-16 pr-8 py-5 rounded-[2rem] border-2 border-transparent font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500/20 transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <div className="h-px bg-gray-100 my-4" />
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Mật khẩu mới</label>
                            <div className="relative">
                                <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input 
                                    type="password"
                                    required
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                    className="w-full bg-gray-50 pl-16 pr-8 py-5 rounded-[2rem] border-2 border-transparent font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500/20 transition-all"
                                    placeholder="Nhập mật khẩu mới"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-4">Xác nhận mật khẩu mới</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                                <input 
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                    className="w-full bg-gray-50 pl-16 pr-8 py-5 rounded-[2rem] border-2 border-transparent font-bold text-gray-700 outline-none focus:bg-white focus:border-blue-500/20 transition-all"
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-gray-900 text-white py-6 rounded-[2.5rem] font-black text-xl shadow-xl shadow-gray-200 hover:bg-black transition-all">
                            Cập nhật mật khẩu
                        </button>
                    </form>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
