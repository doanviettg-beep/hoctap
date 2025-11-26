import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Play, FileCheck } from 'lucide-react';
import { Grade, Semester, Subject, ExamConfig, OnlineQuizData, QuizQuestion } from '../types';
import { generateOnlineQuiz } from '../services/geminiService';

const OnlineTest: React.FC = () => {
  // Phase: 'setup' -> 'loading' -> 'taking' -> 'finished'
  const [phase, setPhase] = useState<'setup' | 'loading' | 'taking' | 'finished'>('setup');
  
  const [config, setConfig] = useState<ExamConfig>({
    grade: Grade.GRADE_3,
    subject: Subject.IT,
    semester: Semester.SEM_1,
    matrixFile: null
  });

  const [quizData, setQuizData] = useState<OnlineQuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, any>>({});
  const [timeLeft, setTimeLeft] = useState(35 * 60); // 35 minutes in seconds

  // Timer logic
  useEffect(() => {
    if (phase === 'taking' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (phase === 'taking' && timeLeft === 0) {
      handleSubmit();
    }
  }, [phase, timeLeft]);

  const handleStart = async () => {
    setPhase('loading');
    try {
      const data = await generateOnlineQuiz(config);
      setQuizData(data);
      setTimeLeft(35 * 60);
      setUserAnswers({});
      setPhase('taking');
    } catch (e) {
      alert("Không thể tạo bài thi. Vui lòng thử lại.");
      setPhase('setup');
    }
  };

  const handleAnswer = (qId: number, answer: any) => {
    setUserAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const handleSubmit = () => {
    setPhase('finished');
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    let score = 0;
    // Simple scoring logic demonstration
    // MCQ: 0.5 each (16 qs = 8pts)
    // Other: 1pt each (2 qs = 2pts)
    quizData.questions.forEach(q => {
      const userAns = userAnswers[q.id];
      if (!userAns) return;

      if (q.type === 'MCQ' && userAns === q.correctAnswer) {
        score += 0.5;
      }
      // Simplified scoring for complex types for demo purposes
      if (q.type !== 'MCQ') {
          // In a real app, perform deep comparison for Matching/Fill-in
          // Here we assume if they answered something, give partial credit or mock check
          score += 1.0; 
      }
    });
    return Math.min(score, 10); // Cap at 10
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (phase === 'setup') {
    return (
      <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Thi Trực Tuyến</h2>
        <div className="space-y-4">
           <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Khối</label>
            <select className="w-full p-3 border rounded-lg" onChange={(e) => setConfig({...config, grade: e.target.value as Grade})}>
              {Object.values(Grade).map(g => <option key={g} value={g}>{g}</option>)}
            </select>
           </div>
           <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Môn</label>
            <select className="w-full p-3 border rounded-lg" onChange={(e) => setConfig({...config, subject: e.target.value as Subject})}>
              {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
           </div>
           <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Học kì</label>
            <select className="w-full p-3 border rounded-lg" onChange={(e) => setConfig({...config, semester: e.target.value as Semester})}>
              {Object.values(Semester).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
           </div>
           <div className="pt-4">
             <button onClick={handleStart} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex justify-center items-center gap-2 text-lg">
                <Play fill="currentColor" /> Bắt đầu làm bài (35 phút)
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Đang sinh đề thi từ AI...</p>
      </div>
    );
  }

  if (phase === 'taking' && quizData) {
    return (
      <div className="max-w-3xl mx-auto pb-20">
        {/* Sticky Header */}
        <div className="sticky top-4 z-10 bg-white p-4 rounded-xl shadow-lg border border-blue-100 flex justify-between items-center mb-6">
           <h3 className="font-bold text-gray-800">{quizData.title || "Bài kiểm tra"}</h3>
           <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-blue-600'}`}>
              <Clock size={24} /> {formatTime(timeLeft)}
           </div>
        </div>

        <div className="space-y-6">
           {quizData.questions.map((q, idx) => (
             <div key={q.id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex gap-3">
                   <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded h-fit">Câu {idx + 1}</span>
                   <div className="flex-1">
                      <p className="font-medium text-lg mb-4 text-gray-800">{q.text}</p>
                      
                      {q.type === 'MCQ' && q.options && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {q.options.map((opt) => {
                             const optKey = opt.charAt(0); // Assumes "A. Content" format
                             return (
                               <label key={opt} className={`flex items-center p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition ${userAnswers[q.id] === optKey ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : ''}`}>
                                  <input 
                                    type="radio" 
                                    name={`q-${q.id}`} 
                                    value={optKey}
                                    checked={userAnswers[q.id] === optKey}
                                    onChange={() => handleAnswer(q.id, optKey)}
                                    className="mr-3 w-4 h-4 text-blue-600"
                                  />
                                  <span>{opt}</span>
                               </label>
                             );
                          })}
                        </div>
                      )}

                      {(q.type === 'MATCHING' || q.type === 'FILL_IN') && (
                        <div className="bg-yellow-50 p-4 rounded border border-yellow-200 text-sm text-yellow-800">
                           <i>(Phần tự luận: Vui lòng điền câu trả lời vào ô trống bên dưới)</i>
                           <textarea 
                             className="w-full mt-2 p-3 border rounded bg-white text-gray-800"
                             rows={3}
                             placeholder="Nhập câu trả lời của bạn..."
                             onChange={(e) => handleAnswer(q.id, e.target.value)}
                           />
                        </div>
                      )}
                   </div>
                </div>
             </div>
           ))}
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center shadow-lg">
           <button 
             onClick={handleSubmit}
             className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-12 rounded-xl shadow-lg transform hover:-translate-y-1 transition text-lg"
           >
             Nộp Bài
           </button>
        </div>
      </div>
    );
  }

  if (phase === 'finished' && quizData) {
     const score = calculateScore();
     return (
       <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg text-center">
          <FileCheck size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Đã hoàn thành!</h2>
          <p className="text-gray-500 mb-6">Bạn đã hoàn thành bài thi môn {config.subject}.</p>
          
          <div className="bg-blue-50 p-6 rounded-xl mb-8">
             <span className="text-gray-600 text-sm uppercase tracking-wide">Điểm số của bạn</span>
             <div className="text-5xl font-bold text-blue-700 mt-2">{score} / 10</div>
          </div>

          <div className="text-left space-y-4">
             <h3 className="font-bold text-lg border-b pb-2">Đáp án chi tiết</h3>
             {quizData.questions.map((q, idx) => (
                <div key={q.id} className="p-3 bg-gray-50 rounded border">
                   <p className="font-medium text-sm text-gray-600 mb-1">Câu {idx + 1}: {q.text}</p>
                   {q.type === 'MCQ' && (
                     <div className="flex gap-4 text-sm">
                        <span className="text-red-500">Chọn: {userAnswers[q.id] || '(Chưa làm)'}</span>
                        <span className="text-green-600 font-bold">Đúng: {q.correctAnswer}</span>
                     </div>
                   )}
                   {q.type !== 'MCQ' && (
                     <p className="text-sm text-gray-500 italic">Câu hỏi tự luận/ghép nối - cần giáo viên chấm chi tiết.</p>
                   )}
                </div>
             ))}
          </div>

          <button 
            onClick={() => setPhase('setup')}
            className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
          >
            Làm bài thi khác
          </button>
       </div>
     );
  }

  return null;
};

export default OnlineTest;
