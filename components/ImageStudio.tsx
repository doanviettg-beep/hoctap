import React, { useState } from 'react';
import { Upload, Briefcase, Users, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { generateCareerImage, mergeTwoImages } from '../services/geminiService';

const CAREERS = [
  'Giáo viên', 'Công an', 'Bác sĩ', 'Cứu hoả', 'Đầu bếp', 'Phi hành gia', 'Kỹ sư', 'Nông dân'
];

const ImageStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'career' | 'merge'>('career');
  
  // States for Career Mode
  const [careerImage, setCareerImage] = useState<File | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string>(CAREERS[0]);
  
  // States for Merge Mode
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [bgImage, setBgImage] = useState<File | null>(null);

  // General States
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCareerGenerate = async () => {
    if (!careerImage) return;
    setIsGenerating(true);
    setError(null);
    setResultImage(null);
    try {
      const result = await generateCareerImage(careerImage, selectedCareer);
      setResultImage(result);
    } catch (e) {
      setError("Có lỗi xảy ra khi tạo ảnh. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMergeGenerate = async () => {
    if (!faceImage || !bgImage) return;
    setIsGenerating(true);
    setError(null);
    setResultImage(null);
    try {
      const result = await mergeTwoImages(faceImage, bgImage);
      setResultImage(result);
    } catch (e) {
      setError("Có lỗi xảy ra khi ghép ảnh. Vui lòng thử lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Sparkles className="text-yellow-500" /> Studio Ảnh AI
        </h2>
        <p className="text-gray-500 mt-2">Sáng tạo hình ảnh với sức mạnh của Gemini AI</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          onClick={() => { setActiveTab('career'); setResultImage(null); setError(null); }}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
            activeTab === 'career' 
              ? 'bg-blue-600 text-white shadow-lg scale-105' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Briefcase size={20} /> Ghép Ảnh Nghề Nghiệp
        </button>
        <button
          onClick={() => { setActiveTab('merge'); setResultImage(null); setError(null); }}
          className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
            activeTab === 'merge' 
              ? 'bg-purple-600 text-white shadow-lg scale-105' 
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Users size={20} /> Ghép 2 Ảnh
        </button>
      </div>

      {/* Controls Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {activeTab === 'career' && (
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">1. Tải ảnh chân dung</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setCareerImage(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  {careerImage ? (
                    <>
                      <img src={URL.createObjectURL(careerImage)} alt="Preview" className="h-32 object-contain mb-2 rounded" />
                      <span className="text-sm text-green-600 font-medium truncate w-full">{careerImage.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="text-gray-400 mb-2" size={32} />
                      <span className="text-gray-500">Nhấn để tải ảnh lên</span>
                    </>
                  )}
                </div>
              </div>

              <label className="block text-sm font-medium text-gray-700">2. Chọn nghề nghiệp</label>
              <select 
                value={selectedCareer}
                onChange={(e) => setSelectedCareer(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              <button
                disabled={!careerImage || isGenerating}
                onClick={handleCareerGenerate}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
              >
                {isGenerating ? <Loader2 className="animate-spin" /> : <Sparkles />} 
                {isGenerating ? 'Đang tạo ảnh...' : 'Tạo ảnh ngay'}
              </button>
            </div>
            
            {/* Result Display */}
            <div className="bg-gray-50 rounded-xl p-4 min-h-[300px] flex items-center justify-center border border-gray-200">
               {resultImage ? (
                 <div className="relative group w-full">
                    <img src={resultImage} alt="AI Result" className="w-full h-auto rounded-lg shadow-md" />
                    <a 
                      href={resultImage} 
                      download="career-image-ai.png"
                      className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm hover:bg-blue-50"
                    >
                      Tải về
                    </a>
                 </div>
               ) : (
                 <div className="text-gray-400 text-center">
                   <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                   <p>Kết quả sẽ hiển thị ở đây</p>
                 </div>
               )}
            </div>
          </div>
        )}

        {activeTab === 'merge' && (
           <div className="grid md:grid-cols-2 gap-8 items-start">
           <div className="space-y-4">
             {/* File 1 */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">1. Ảnh chứa khuôn mặt (Người)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setFaceImage(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {faceImage ? (
                     <div className="flex items-center justify-center gap-2">
                        <img src={URL.createObjectURL(faceImage)} className="h-10 w-10 object-cover rounded-full" />
                        <span className="text-sm truncate">{faceImage.name}</span>
                     </div>
                  ) : <span className="text-gray-400 text-sm">Tải ảnh người lên</span>}
                </div>
             </div>

             {/* File 2 */}
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">2. Ảnh chứa khung cảnh</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => setBgImage(e.target.files?.[0] || null)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {bgImage ? (
                     <div className="flex items-center justify-center gap-2">
                        <img src={URL.createObjectURL(bgImage)} className="h-10 w-10 object-cover rounded" />
                        <span className="text-sm truncate">{bgImage.name}</span>
                     </div>
                  ) : <span className="text-gray-400 text-sm">Tải ảnh cảnh lên</span>}
                </div>
             </div>

             <button
               disabled={!faceImage || !bgImage || isGenerating}
               onClick={handleMergeGenerate}
               className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2"
             >
               {isGenerating ? <Loader2 className="animate-spin" /> : <Users />} 
               {isGenerating ? 'Đang ghép...' : 'Ghép ảnh'}
             </button>
           </div>
           
           {/* Result Display */}
           <div className="bg-gray-50 rounded-xl p-4 min-h-[300px] flex items-center justify-center border border-gray-200">
              {resultImage ? (
                <div className="relative group w-full">
                   <img src={resultImage} alt="AI Result" className="w-full h-auto rounded-lg shadow-md" />
                   <a 
                     href={resultImage} 
                     download="merged-image-ai.png"
                     className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm hover:bg-purple-50"
                   >
                     Tải về
                   </a>
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  <ImageIcon size={48} className="mx-auto mb-2 opacity-30" />
                  <p>Kết quả sẽ hiển thị ở đây</p>
                </div>
              )}
           </div>
         </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageStudio;
