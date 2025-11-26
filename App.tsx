import React, { useState } from 'react';
import Header from './components/Header';
import ImageStudio from './components/ImageStudio';
import ExamGenerator from './components/ExamGenerator';
import OnlineTest from './components/OnlineTest';
import { AppMode } from './types';
import { Image, FileText, MonitorPlay, Home } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);

  const renderContent = () => {
    switch (mode) {
      case AppMode.IMAGE_STUDIO:
        return <ImageStudio />;
      case AppMode.EXAM_GENERATOR:
        return <ExamGenerator />;
      case AppMode.ONLINE_TEST:
        return <OnlineTest />;
      case AppMode.HOME:
      default:
        return (
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10">
            <div 
              onClick={() => setMode(AppMode.IMAGE_STUDIO)}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 group text-center"
            >
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Image size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Ghép Ảnh AI</h3>
              <p className="text-gray-500">Ghép ảnh nghề nghiệp và ghép bối cảnh tự động thông minh.</p>
            </div>

            <div 
              onClick={() => setMode(AppMode.EXAM_GENERATOR)}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 group text-center"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Tạo Đề & Ôn Tập</h3>
              <p className="text-gray-500">Sinh đề thi tự động từ ma trận và xuất ra file Word.</p>
            </div>

            <div 
              onClick={() => setMode(AppMode.ONLINE_TEST)}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all cursor-pointer border border-gray-100 group text-center"
            >
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <MonitorPlay size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Thi Trực Tuyến</h3>
              <p className="text-gray-500">Làm bài kiểm tra online có tính giờ và chấm điểm ngay.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />
      
      {/* Navigation Bar */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto py-2">
            <button 
              onClick={() => setMode(AppMode.HOME)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${mode === AppMode.HOME ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Home size={18} /> Trang Chủ
            </button>
            <div className="w-px bg-gray-200 mx-2 h-6 self-center"></div>
            <button 
              onClick={() => setMode(AppMode.IMAGE_STUDIO)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${mode === AppMode.IMAGE_STUDIO ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Image size={18} /> Ghép Ảnh
            </button>
            <button 
              onClick={() => setMode(AppMode.EXAM_GENERATOR)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${mode === AppMode.EXAM_GENERATOR ? 'bg-green-50 text-green-700' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <FileText size={18} /> Tạo Đề
            </button>
            <button 
              onClick={() => setMode(AppMode.ONLINE_TEST)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${mode === AppMode.ONLINE_TEST ? 'bg-purple-50 text-purple-700' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <MonitorPlay size={18} /> Thi Online
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8">
        {renderContent()}
      </main>

      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        <p>© 2024 Trường TH&THCS Nà Sáy - UBND Xã Chiềng Sinh. Powered by Google Gemini AI.</p>
      </footer>
    </div>
  );
};

export default App;
