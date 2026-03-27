import React, { useState } from 'react';
import { ocrService } from '../services/api';
import { 
  ShieldCheck, 
  UploadCloud, 
  Scan, 
  User, 
  Calendar, 
  CreditCard,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

const VerifyID = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setRotation(0);
      setResult(null);
      setError(null);
    }
  };

  const rotateImage = (blob, degrees) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (degrees % 180 === 0) {
          canvas.width = img.width;
          canvas.height = img.height;
        } else {
          canvas.width = img.height;
          canvas.height = img.width;
        }
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((degrees * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        canvas.toBlob((rotatedBlob) => {
          resolve(rotatedBlob);
        }, 'image/jpeg', 0.95);
      };
      img.src = URL.createObjectURL(blob);
    });
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      let fileToUpload = file;
      if (rotation !== 0) {
        const rotatedBlob = await rotateImage(file, rotation);
        fileToUpload = new File([rotatedBlob], file.name, { type: 'image/jpeg' });
      }

      const formData = new FormData();
      formData.append('id_card', fileToUpload);

      const res = await ocrService.extractId(formData);
      setResult(res.data.extracted_data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể xử lý ảnh. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 shadow-inner">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <div className="bg-blue-600 w-16 h-16 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200">
                <ShieldCheck size={32} />
            </div>
            <h1 className="text-5xl font-black text-gray-800 tracking-tighter mb-4">Xác minh danh tính</h1>
            <p className="text-gray-500 text-lg font-medium max-w-2xl mx-auto">
               Vui lòng tải lên ảnh mặt trước CCCD của bạn để hoàn tất hồ sơ khách hàng và mở khóa các tính năng cao cấp.
            </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Upload Section */}
          <div className="space-y-6">
            <div 
                className={`relative h-80 rounded-[3rem] border-4 border-dashed transition-all flex flex-col items-center justify-center p-8 text-center
                ${preview ? 'border-blue-500 bg-white' : 'border-gray-200 bg-gray-50 hover:bg-white hover:border-blue-300'}`}
            >
                {preview ? (
                    <div className="relative w-full h-full overflow-hidden flex items-center justify-center">
                        <img 
                          src={preview} 
                          className="max-w-full max-h-full object-contain rounded-[2rem] shadow-lg transition-transform duration-300" 
                          style={{ transform: `rotate(${rotation}deg)` }}
                          alt="Preview" 
                        />
                        <button 
                            onClick={(e) => { e.stopPropagation(); handleRotate(); }}
                            className="absolute top-4 right-4 bg-white/90 backdrop-blur p-3 rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all text-blue-600 z-10"
                            title="Xoay ảnh 90°"
                        >
                            <RefreshCw size={20} />
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="bg-blue-50 p-6 rounded-full text-blue-500 mb-4">
                            <UploadCloud size={48} />
                        </div>
                        <p className="text-gray-400 font-bold mb-2">Nhấn để tải lên hoặc kéo thả</p>
                        <p className="text-xs text-gray-300 font-bold uppercase tracking-widest">PNG, JPG tối đa 5MB</p>
                        <input 
                            type="file" 
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                        />
                    </>
                )}
            </div>

            <button 
                onClick={handleUpload}
                disabled={!file || loading}
                className={`w-full py-6 rounded-3xl font-black text-xl shadow-2xl transition-all flex items-center justify-center gap-3
                ${!file || loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
            >
                {loading ? (
                    <>
                        <RefreshCw className="animate-spin" size={24} /> 
                        Đang xử lý OCR...
                    </>
                ) : (
                    <>
                        <Scan size={24} />
                        Bắt đầu quét CCCD
                    </>
                )}
            </button>

            {error && (
                <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center gap-4 text-red-600 animate-in slide-in-from-top-4 duration-300">
                    <AlertCircle className="shrink-0" size={24} />
                    <p className="font-bold">{error}</p>
                </div>
            )}
          </div>

          {/* Results Section */}
          <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300">
                    <User size={48} />
                </div>
            </div>

            <h3 className="text-2xl font-black text-blue-900 mb-2 tracking-tight">Kết quả trích xuất</h3>
            <p className="text-sm text-gray-400 font-medium mb-12">Thông tin được hệ thống tự động nhận diện</p>

            <div className="space-y-8">
                <div className="flex gap-6 items-start">
                    <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Họ và tên</p>
                        <p className="font-black text-gray-800 text-xl tracking-tight uppercase">
                            {result?.full_name || '---'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 items-start">
                    <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Số định danh (CCCD)</p>
                        <p className="font-black text-gray-800 text-xl tracking-tighter">
                            {result?.id_number || '---'}
                        </p>
                    </div>
                </div>

                <div className="flex gap-6 items-start">
                    <div className="bg-purple-50 p-4 rounded-2xl text-purple-600">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Ngày sinh</p>
                        <p className="font-black text-gray-800 text-xl tracking-tight">
                            {result?.dob || '---'}
                        </p>
                    </div>
                </div>

                {result && (
                    <div className="pt-6 border-t border-gray-100 mt-12">
                        <div className="bg-green-50 p-4 rounded-2xl flex items-center gap-3 text-green-600">
                            <CheckCircle2 size={20} />
                            <span className="font-bold">Đã lưu thông tin vào hệ thống</span>
                        </div>
                    </div>
                )}
                
                {!result && !loading && (
                    <div className="h-24 flex items-center justify-center text-gray-300 font-bold border-2 border-dashed border-gray-100 rounded-3xl">
                        Vui lòng quét để xem chi tiết
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* OCR Security Note */}
        <div className="mt-20 bg-blue-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 scale-150 rotate-12">
                <ShieldCheck size={200} />
            </div>
            <div className="relative z-10">
                <h4 className="text-3xl font-black mb-4 tracking-tight uppercase italic">Bảo mật thông tin</h4>
                <div className="grid md:grid-cols-3 gap-8 text-blue-200">
                    <div className="space-y-2">
                        <p className="font-black text-white text-lg">Mã hóa đầu cuối</p>
                        <p className="text-sm font-medium">Ảnh của bạn được mã hóa ngay khi tải lên.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-black text-white text-lg">Xử lý tự động</p>
                        <p className="text-sm font-medium">Hệ thống AI xử lý độc lập, không có sự can thiệp của con người.</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-black text-white text-lg">Xóa dữ liệu ảnh</p>
                        <p className="text-sm font-medium">Ảnh gốc sẽ được xóa sau khi trích xuất dữ liệu thành công.</p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyID;
