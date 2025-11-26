import { GoogleGenAI } from "@google/genai";
import { ExamConfig } from "../types";

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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
 * Edit Image using Text Prompt (Gemini 2.5 Flash Image)
 */
export const editImageWithPrompt = async (
  image: File,
  prompt: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const imagePart = await fileToGenerativePart(image);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [imagePart, { text: prompt }]
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("Không chỉnh sửa được ảnh.");
  } catch (error) {
    console.error("Lỗi chỉnh sửa ảnh:", error);
    throw error;
  }
};

/**
 * Generate High Quality Image (Gemini 3 Pro Image)
 */
export const generateProImage = async (
  prompt: string,
  size: '1K' | '2K' | '4K'
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("Không tạo được ảnh Pro.");
  } catch (error) {
    console.error("Lỗi tạo ảnh Pro:", error);
    throw error;
  }
};

/**
 * Generate Video from Image (Veo 3.1)
 */
export const generateVeoVideo = async (
  image: File,
  prompt: string,
  aspectRatio: '16:9' | '9:16'
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const imagePart = await fileToGenerativePart(image);

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Làm chuyển động hình ảnh này một cách tự nhiên",
      image: {
        imageBytes: imagePart.inlineData.data,
        mimeType: imagePart.inlineData.mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    // Polling
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000));
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Không tìm thấy URI video.");

    // The response body contains the MP4 bytes. Must append API key.
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await videoResponse.blob();
    return URL.createObjectURL(blob);

  } catch (error) {
    console.error("Lỗi tạo video Veo:", error);
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const parts: any[] = [{ text: buildExamPrompt(config, false) }];
    
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const parts: any[] = [{ text: buildExamPrompt(config, true) }];

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
