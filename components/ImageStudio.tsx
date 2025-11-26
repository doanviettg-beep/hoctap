import React, { useState } from 'react';
import { Upload, Briefcase, Users, Image as ImageIcon, Sparkles, Loader2, Wand2, Crown, Clapperboard, Video } from 'lucide-react';
import { generateCareerImage, mergeTwoImages, editImageWithPrompt, generateProImage, generateVeoVideo } from '../services/geminiService';

const CAREERS = [
  'Giáo viên', 'Công an', 'Bác sĩ', 'Cứu hoả', 'Đầu bếp', 'Phi hành gia', 'Kỹ sư', 'Nông dân'
];

// Helper to access global aistudio object
const getAiStudio = () => (window as any).aistudio;

const ImageStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'career' | 'merge' | 'edit' | 'genPro' | 'veo'>('career');
  
  // States for Career Mode
  const [careerImage, setCareerImage] = useState<File | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string>(CAREERS[0]);
  
  // States for Merge Mode
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [bgImage, setBgImage] = useState<File | null>(null);

  // States for Edit Mode
  const [editSourceImage, setEditSourceImage] = useState<File | null>(null);
  const [editPrompt, setEditPrompt] = useState<string>("");

  // States for Pro Gen Mode
  const [proPrompt, setProPrompt] = useState<string>("");
  const [proSize, setProSize] = useState<'1K' | '2K' | '4K'>('1K');

  // States for Veo Mode
  const [veoImage, setVeoImage] = useState<File | null>(null);
  const [veoPrompt, setVeoPrompt] = useState<string>("");
  const [veoRatio, setVeoRatio] = useState<'16:9' | '9:16'>('16:9');

  // General States
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [resultVideo, setResultVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = (tab: any) => {
    setActiveTab(tab);
    setResultImage(null);
    setResultVideo(null);
    setError(null);
  };

  const ensureApiKey = async () => {
    const aiStudio = getAiStudio();
    if (aiStudio && aiStudio.hasSelectedApiKey && aiStudio.openSelectKey) {
      const hasKey = await aiStudio.hasSelectedApiKey();
      if (!hasKey) {
        await aiStudio.openSelectKey();
        // Check again after dialog potentially closes, or just proceed assuming user did it.
        // To be safe, checking again might be good, but race conditions exist. 
        // We will assume if openSelectKey resolves, we can try.
      }
    }
  };

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

  const handleEditGenerate = async () => {
    if (!editSourceImage || !editPrompt) return;
    setIsGenerating(true);
    setError(null);
    setResultImage(null);
    try {
      const result = await editImageWithPrompt(editSourceImage, editPrompt);
      setResultImage(result);
    } catch (e) {
      setError("Có lỗi xảy ra khi chỉnh sửa ảnh.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleProGenerate = async () => {
    if (!proPrompt) return;
    await ensureApiKey(); // Premium feature
    setIsGenerating(true);
    setError(null);
    setResultImage(null);
    try {
      const result = await generateProImage(proPrompt, proSize);
      setResultImage(result);
    } catch (e) {
      setError("Lỗi tạo ảnh. Vui lòng kiểm tra API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleVeoGenerate = async () => {
    if (!veoImage) return;
    await ensureApiKey(); // Premium feature
    setIsGenerating(true);
    setError(null);
    setResultVideo(null);
    try {
      const result = await generateVeoVideo(veoImage, veoPrompt, veoRatio);
      setResultVideo(result);
    } catch (e) {
      setError("Lỗi tạo video. Có thể mất vài phút hoặc do API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <Sparkles className="text-yellow-500" /> Studio Sáng Tạo AI
        </h2>
        <p className="text-gray-500 mt-2">Nghề nghiệp • Ghép ảnh • Chỉnh sửa • Tạo mới • Video</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {[
          { id: 'career', label: 'Nghề Nghiệp', icon: <Briefcase size={18} /> },
          { id: 'merge', label: 'Ghép Ảnh', icon: <Users size={18} /> },
          { id: 'edit', label: 'Chỉnh Sửa', icon: <Wand2 size={18} /> },
          { id: 'genPro', label: 'Tạo Ảnh Pro', icon: <Crown size={18} /> },
          { id: 'veo', label: 'Tạo Video', icon: <Video size={18} /> },
        ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => resetState(tab.id)}
             className={`px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
               activeTab === tab.id 
                 ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
                 : 'bg-white text-gray-600 hover:bg-gray-50'
             }`}
           >
             {tab.icon} {tab.label}
           </button>
        ))}
      </div>

      {/* Controls Area */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
        <div className="grid md:grid-cols-2 gap-8 items-start h-full">
          {/* LEFT: INPUTS */}
          <div className="space-y-6">
            
            {/* --- CAREER MODE --- */}
            {activeTab === 'career' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh chân dung</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative h-48 flex flex-col justify-center items-center">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setCareerImage(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {careerImage ? (
                      <img src={URL.createObjectURL(careerImage)} alt="Preview" className="h-full object-contain rounded" />
                    ) : (
                      <>
                        <Upload className="text-gray-400 mb-2" size={32} />
                        <span className="text-gray-500 text-sm">Nhấn để tải ảnh lên</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chọn nghề nghiệp</label>
                  <select 
                    value={selectedCareer}
                    onChange={(e) => setSelectedCareer(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {CAREERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button
                  disabled={!careerImage || isGenerating}
                  onClick={handleCareerGenerate}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Briefcase />} 
                  {isGenerating ? 'Đang xử lý...' : 'Tạo Ảnh'}
                </button>
              </>
            )}

            {/* --- MERGE MODE --- */}
            {activeTab === 'merge' && (
              <>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">1. Ảnh người</label>
                    <input type="file" accept="image/*" onChange={(e) => setFaceImage(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">2. Ảnh bối cảnh</label>
                    <input type="file" accept="image/*" onChange={(e) => setBgImage(e.target.files?.[0] || null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"/>
                 </div>
                 <button
                   disabled={!faceImage || !bgImage || isGenerating}
                   onClick={handleMergeGenerate}
                   className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 mt-4"
                 >
                   {isGenerating ? <Loader2 className="animate-spin" /> : <Users />} 
                   {isGenerating ? 'Đang xử lý...' : 'Ghép Ảnh'}
                 </button>
              </>
            )}

            {/* --- EDIT MODE --- */}
            {activeTab === 'edit' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh cần sửa</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative h-48 flex flex-col justify-center items-center">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setEditSourceImage(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                     {editSourceImage ? (
                      <img src={URL.createObjectURL(editSourceImage)} alt="Preview" className="h-full object-contain rounded" />
                    ) : (
                      <div className="text-gray-400"><Upload className="mx-auto mb-2" />Tải ảnh gốc</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Yêu cầu chỉnh sửa</label>
                  <textarea 
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder='Ví dụ: "Thêm bộ lọc màu cổ điển", "Xóa người ở nền"...'
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none h-24 resize-none"
                  />
                </div>
                <button
                  disabled={!editSourceImage || !editPrompt || isGenerating}
                  onClick={handleEditGenerate}
                  className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 />} 
                  {isGenerating ? 'Đang xử lý...' : 'Chỉnh Sửa'}
                </button>
              </>
            )}

            {/* --- GEN PRO MODE --- */}
            {activeTab === 'genPro' && (
              <>
                <div className="bg-amber-50 p-3 rounded-lg text-amber-800 text-xs mb-2 flex items-center gap-2">
                   <Crown size={14} /> Tính năng cao cấp: Sử dụng Gemini 3 Pro (Yêu cầu API Key trả phí)
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả hình ảnh</label>
                  <textarea 
                    value={proPrompt}
                    onChange={(e) => setProPrompt(e.target.value)}
                    placeholder='Mô tả chi tiết hình ảnh bạn muốn tạo...'
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none h-32 resize-none"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Độ phân giải</label>
                   <div className="flex gap-4">
                      {['1K', '2K', '4K'].map((size) => (
                        <label key={size} className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition ${proSize === size ? 'bg-amber-100 border-amber-500 font-bold' : 'hover:bg-gray-50'}`}>
                           <input type="radio" name="size" className="hidden" value={size} checked={proSize === size} onChange={() => setProSize(size as any)} />
                           {size}
                        </label>
                      ))}
                   </div>
                </div>
                <button
                  disabled={!proPrompt || isGenerating}
                  onClick={handleProGenerate}
                  className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 mt-4"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Crown />} 
                  {isGenerating ? 'Đang xử lý...' : 'Tạo Ảnh Pro'}
                </button>
              </>
            )}

            {/* --- VEO MODE --- */}
            {activeTab === 'veo' && (
              <>
                <div className="bg-indigo-50 p-3 rounded-lg text-indigo-800 text-xs mb-2 flex items-center gap-2">
                   <Video size={14} /> Veo Video Generation: Mất vài phút để tạo video (Yêu cầu API Key trả phí)
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh gốc</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer relative h-40 flex flex-col justify-center items-center">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setVeoImage(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                     {veoImage ? (
                      <img src={URL.createObjectURL(veoImage)} alt="Preview" className="h-full object-contain rounded" />
                    ) : (
                      <div className="text-gray-400"><Upload className="mx-auto mb-2" />Tải ảnh để tạo video</div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả chuyển động (Tùy chọn)</label>
                  <input 
                    type="text"
                    value={veoPrompt}
                    onChange={(e) => setVeoPrompt(e.target.value)}
                    placeholder='Ví dụ: Camera zoom in, nước chảy...'
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">Tỉ lệ khung hình</label>
                   <div className="flex gap-4">
                      <label className={`flex-1 border rounded-lg p-3 text-center cursor-pointer ${veoRatio === '16:9' ? 'bg-indigo-100 border-indigo-500 font-bold' : ''}`}>
                         <input type="radio" name="ratio" className="hidden" checked={veoRatio === '16:9'} onChange={() => setVeoRatio('16:9')} />
                         Ngang (16:9)
                      </label>
                      <label className={`flex-1 border rounded-lg p-3 text-center cursor-pointer ${veoRatio === '9:16' ? 'bg-indigo-100 border-indigo-500 font-bold' : ''}`}>
                         <input type="radio" name="ratio" className="hidden" checked={veoRatio === '9:16'} onChange={() => setVeoRatio('9:16')} />
                         Dọc (9:16)
                      </label>
                   </div>
                </div>
                <button
                  disabled={!veoImage || isGenerating}
                  onClick={handleVeoGenerate}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 mt-2"
                >
                  {isGenerating ? <Loader2 className="animate-spin" /> : <Clapperboard />} 
                  {isGenerating ? 'Đang tạo Video...' : 'Tạo Video'}
                </button>
              </>
            )}

            {error && (
              <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center border border-red-100">
                {error}
                { (activeTab === 'veo' || activeTab === 'genPro') && (
                    <div className="mt-2 text-xs text-red-500">
                       Lưu ý: Tính năng này yêu cầu API Key của dự án có trả phí. 
                       <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline font-bold ml-1">Xem chi tiết</a>
                    </div>
                )}
              </div>
            )}
          </div>
          
          {/* RIGHT: RESULT DISPLAY */}
          <div className="bg-gray-50 rounded-xl p-4 h-full flex items-center justify-center border border-gray-200 min-h-[300px]">
             {isGenerating ? (
               <div className="text-center text-gray-500">
                 <Loader2 size={48} className="animate-spin mx-auto mb-4 text-blue-500" />
                 <p className="font-medium animate-pulse">Đang thực hiện phép màu AI...</p>
                 {activeTab === 'veo' && <p className="text-xs mt-2 text-gray-400">(Quá trình tạo video có thể mất 1-2 phút)</p>}
               </div>
             ) : (
               <>
                 {resultImage && (
                   <div className="relative group w-full h-full flex items-center justify-center">
                      <img src={resultImage} alt="AI Result" className="max-w-full max-h-[500px] object-contain rounded-lg shadow-md" />
                      <a 
                        href={resultImage} 
                        download={`ai-generated-${Date.now()}.png`}
                        className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity font-medium text-sm hover:bg-blue-50 flex items-center gap-2"
                      >
                        <Upload className="rotate-180" size={16} /> Tải về
                      </a>
                   </div>
                 )}

                 {resultVideo && (
                   <div className="w-full">
                      <video controls src={resultVideo} className="w-full rounded-lg shadow-md max-h-[500px]" autoPlay loop />
                      <div className="text-center mt-2">
                         <a href={resultVideo} download="veo-video.mp4" className="text-blue-600 text-sm font-medium hover:underline">Tải video về máy</a>
                      </div>
                   </div>
                 )}

                 {!resultImage && !resultVideo && (
                   <div className="text-gray-400 text-center">
                     {activeTab === 'veo' ? <Video size={64} className="mx-auto mb-3 opacity-20" /> : <ImageIcon size={64} className="mx-auto mb-3 opacity-20" />}
                     <p>Kết quả sẽ hiển thị ở đây</p>
                   </div>
                 )}
               </>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
