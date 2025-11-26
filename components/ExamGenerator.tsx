import React, { useState } from 'react';
import { FileText, Download, Loader2, UploadCloud } from 'lucide-react';
import { Grade, Semester, Subject, ExamConfig } from '../types';
import { generateExamDoc } from '../services/geminiService';

const ExamGenerator: React.FC = () => {
  const [config, setConfig] = useState<ExamConfig>({
    grade: Grade.GRADE_3,
    subject: Subject.IT,
    semester: Semester.SEM_1,
    matrixFile: null,
    specFile: null
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent(null);
    try {
      const content = await generateExamDoc(config);
      setGeneratedContent(content);
    } catch (e) {
      alert("Lỗi tạo đề. Vui lòng kiểm tra lại.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadWord = () => {
    if (!generatedContent) return;

    // Construct a minimal HTML document for Word
    const htmlContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Đề Thi</title></head>
      <body>
        <div style="font-family: 'Times New Roman', serif; line-height: 1.5;">
          <table style="width: 100%; margin-bottom: 20px;">
             <tr>
                <td style="text-align: center; width: 40%;">
                   UBND XÃ CHIỀNG SINH<br/>
                   <b>TRƯỜNG TH&THCS NÀ SÁY</b>
                </td>
                <td style="text-align: center; width: 60%;">
                   <b>ĐỀ KIỂM TRA ${config.subject.toUpperCase()} ${config.grade.toUpperCase()}</b><br/>
                   <i>${config.semester} - Thời gian: 35 phút</i>
                </td>
             </tr>
          </table>
          <hr/>
          ${generatedContent}
        </div>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `De_Thi_${config.subject}_${config.grade}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
          <FileText className="text-blue-600" /> Tạo Đề Kiểm Tra & Ôn Tập
        </h2>
        <p className="text-gray-500 mt-2">Sinh đề tự động ra file Word dựa trên ma trận và đặc tả</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="md:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Khối Lớp</label>
            <select 
              className="w-full p-2 border rounded-lg"
              value={config.grade}
              onChange={(e) => setConfig({...config, grade: e.target.value as Grade})}
            >
              {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Môn Học</label>
            <select 
               className="w-full p-2 border rounded-lg"
               value={config.subject}
               onChange={(e) => setConfig({...config, subject: e.target.value as Subject})}
            >
              {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Học Kì</label>
            <select 
              className="w-full p-2 border rounded-lg"
              value={config.semester}
              onChange={(e) => setConfig({...config, semester: e.target.value as Semester})}
            >
              {Object.values(Semester).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-sm font-semibold text-gray-700 mb-2">File Ma trận & Đặc tả</label>
            <div className="space-y-3">
               <div className="relative">
                 <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={(e) => setConfig({...config, matrixFile: e.target.files?.[0]})}
                 />
                 <div className="p-3 border border-dashed rounded-lg bg-gray-50 text-xs text-center hover:bg-blue-50 transition cursor-pointer flex items-center justify-center gap-2 text-gray-600">
                    <UploadCloud size={14} />
                    {config.matrixFile ? config.matrixFile.name : "Tải lên Ma trận"}
                 </div>
               </div>
               <div className="relative">
                 <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    onChange={(e) => setConfig({...config, specFile: e.target.files?.[0]})}
                 />
                 <div className="p-3 border border-dashed rounded-lg bg-gray-50 text-xs text-center hover:bg-blue-50 transition cursor-pointer flex items-center justify-center gap-2 text-gray-600">
                    <UploadCloud size={14} />
                    {config.specFile ? config.specFile.name : "Tải lên Bản đặc tả"}
                 </div>
               </div>
            </div>
            <p className="text-xs text-gray-400 mt-2 italic">*Hỗ trợ .docx, .xlsx, .pdf, ảnh</p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2 disabled:bg-gray-300"
          >
             {isGenerating ? <Loader2 className="animate-spin" /> : <FileText />}
             {isGenerating ? 'Đang tạo...' : 'Tạo Đề Thi'}
          </button>
        </div>

        {/* Preview Panel */}
        <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
           {generatedContent ? (
             <>
               <div className="flex justify-between items-center mb-4 pb-4 border-b">
                 <h3 className="font-bold text-gray-700">Xem trước nội dung</h3>
                 <button 
                   onClick={handleDownloadWord}
                   className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"
                 >
                   <Download size={16} /> Tải File Word (.doc)
                 </button>
               </div>
               <div 
                 className="prose max-w-none flex-grow overflow-y-auto max-h-[600px] p-4 bg-gray-50 rounded border"
                 dangerouslySetInnerHTML={{ __html: generatedContent }}
               />
             </>
           ) : (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
               <FileText size={64} className="mb-4 opacity-20" />
               <p>Chọn thông số và nhấn "Tạo Đề Thi" để xem kết quả</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ExamGenerator;
