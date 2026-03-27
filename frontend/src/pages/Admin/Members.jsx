import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Shield, MoreVertical } from 'lucide-react';
import { adminService } from '../../services/api';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking for now, real implementation would call adminService.getMembers()
    setTimeout(() => {
      setMembers([
        { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', created_at: '2023-01-01' },
        { id: 2, username: 'johndoe', email: 'john@example.com', role: 'user', created_at: '2023-05-12' },
        { id: 3, username: 'janepereira', email: 'jane@example.com', role: 'user', created_at: '2023-08-20' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Thành viên</h1>
          <p className="text-gray-500 mt-1">Quản lý người dùng và vai trò trong hệ thống.</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors">
          <Users size={18} />
          Thêm người dùng mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm kiếm thành viên..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50 uppercase text-xs font-semibold text-gray-500">
            <tr>
              <th className="px-6 py-4 text-left">Người dùng</th>
              <th className="px-6 py-4 text-left">Vai trò</th>
              <th className="px-6 py-4 text-left">Ngày tham gia</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map(member => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold uppercase">
                      {member.username.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{member.username}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail size={12} /> {member.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit
                    ${member.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    <Shield size={12} /> {member.role === 'admin' ? 'Quản trị viên' : 'Khách hàng'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Members;
