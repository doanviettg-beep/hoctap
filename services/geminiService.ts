import { GoogleGenAI, Type } from "@google/genai";
import { ExamConfig } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to convert File to Base64
export const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64String,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Image Generation/Editing using gemini-2.5-flash-image
 */
export const generateCareerImage = async (
  personImage: File,
  career: string
): Promise<string> => {
  try {
    const imagePart = await fileToGenerativePart(personImage);
    const prompt = `Đây là ảnh khuôn mặt của một người. Hãy tạo một hình ảnh thực tế chất lượng cao, ghép khuôn mặt người này vào vai một ${career} (nghề nghiệp). 
    Giữ các đặc điểm khuôn mặt dễ nhận biết. Bối cảnh phải phù hợp với nghề nghiệp. 
    Tỉ lệ ảnh 1:1.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, { text: prompt }]
      },
    });

    // Check inline data first
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("Không tạo được ảnh.");
  } catch (error) {
    console.error("Lỗi tạo ảnh nghề nghiệp:", error);
    throw error;
  }
};

export const mergeTwoImages = async (
  faceImage: File,
  bgImage: File
): Promise<string> => {
  try {
    const facePart = await fileToGenerativePart(faceImage);
    const bgPart = await fileToGenerativePart(bgImage);

    const prompt = `Ghép người từ hình ảnh thứ nhất vào bối cảnh của hình ảnh thứ hai. 
    Hãy làm cho ánh sáng, bóng đổ và tỷ lệ thật tự nhiên và chân thực.
    Người nên là tiêu điểm chính trong khung cảnh mới.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [facePart, bgPart, { text: prompt }]
      },
    });

     for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Không ghép được ảnh.");
  } catch (error) {
    console.error("Lỗi ghép ảnh:", error);
    throw error;
  }
};

/**
 * Text Generation for Exams using gemini-2.5-flash
 */
const buildExamPrompt = (config: ExamConfig, isOnline: boolean): string => {
  return `
    Bạn là một giáo viên tiểu học tại Việt Nam.
    Hãy tạo một đề kiểm tra môn ${config.subject} cho ${config.grade}, ${config.semester}.
    Bộ sách: Kết nối tri thức với cuộc sống.
    
    Cấu trúc đề thi (Tổng 10 điểm):
    1. Phần Trắc nghiệm (8 điểm): 16 câu hỏi, mỗi câu 4 lựa chọn (A, B, C, D).
    2. Phần Tự luận/Vận dụng (2 điểm):
       - Câu 17: Nối các ý ở cột A với ý ở cột B (4 cặp nối).
       - Câu 18: Điền từ vào chỗ trống (2 ý a, b; mỗi ý 2 chỗ trống).

    ${config.matrixFile ? " (Đã có file ma trận đính kèm - hãy phân tích nội dung file nếu có thể để bám sát)" : ""}
    ${config.specFile ? " (Đã có file bản đặc tả đính kèm - hãy bám sát)" : ""}

    ${isOnline 
      ? `QUAN TRỌNG: Trả về định dạng JSON thuần túy (không bọc trong markdown code block) theo schema sau:
         {
           "title": "Tên đề thi",
           "questions": [
             {
               "id": 1,
               "type": "MCQ",
               "text": "Nội dung câu hỏi",
               "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
               "correctAnswer": "A" (chỉ ghi ký tự đáp án đúng)
             },
             ... (tiếp tục cho 16 câu trắc nghiệm),
             {
                "id": 17,
                "type": "MATCHING",
                "text": "Nối cột A với cột B",
                "matchingPairs": [{"a": "Nội dung A1", "b": "Nội dung B1 phù hợp"}, ...]
             },
             {
                "id": 18,
                "type": "FILL_IN",
                "text": "Điền từ thích hợp",
                "fillInParts": [
                   {"text": "Đoạn văn có ... chỗ trống ...", "blanks": 2, "answers": ["từ 1", "từ 2"]}
                ]
             }
           ]
         }` 
      : `QUAN TRỌNG: Trả về nội dung HTML (chỉ phần body content, không cần tag html/head) được định dạng đẹp để xuất ra file Word (.doc).
         - Sử dụng thẻ <h3> cho tiêu đề.
         - Sử dụng <b> cho câu hỏi.
         - Trình bày rõ ràng.
         - Cuối đề có phần Đáp án chi tiết.`
    }
  `;
};

export const generateExamDoc = async (config: ExamConfig): Promise<string> => {
  try {
    const parts: any[] = [{ text: buildExamPrompt(config, false) }];
    
    // Add files if they exist (assuming they are images or text files we can read)
    // Note: Gemini API mainly accepts images/PDFs/Videos for multimodal. 
    // For DOCX/XLSX, in a real app we'd parse text. Here we assume user might upload images of the matrix.
    // If text files, we'd read text. For simplicity in this demo, we assume they act as context prompts or are skipped if not image/pdf.
    if (config.matrixFile && config.matrixFile.type.startsWith('image/')) {
       parts.push(await fileToGenerativePart(config.matrixFile));
    }
    if (config.specFile && config.specFile.type.startsWith('image/')) {
       parts.push(await fileToGenerativePart(config.specFile));
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
    });

    return response.text || "Không tạo được nội dung đề thi.";
  } catch (error) {
    console.error("Lỗi tạo đề thi Word:", error);
    throw error;
  }
};

export const generateOnlineQuiz = async (config: ExamConfig): Promise<any> => {
  try {
    const parts: any[] = [{ text: buildExamPrompt(config, true) }];

    // Similar handling for files as context
    if (config.matrixFile && config.matrixFile.type.startsWith('image/')) {
       parts.push(await fileToGenerativePart(config.matrixFile));
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
      config: {
        responseMimeType: "application/json"
      }
    });

    const jsonText = response.text || "{}";
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Lỗi tạo đề thi Online:", error);
    throw error;
  }
};
