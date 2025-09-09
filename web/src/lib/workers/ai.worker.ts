import * as tf from '@tensorflow/tfjs';
import natural from 'natural';
import Tesseract from 'tesseract.js';

interface WorkerResult {
  success: boolean;
  result?: any;
  error?: string;
}

// API URLs
const AI_BACKEND_URL = 'http://localhost:8080/api/ai';

// Khởi tạo TensorFlow
async function initTensorFlow() {
  await tf.ready();
  // Load pretrained model cho manga detection
  const model = await tf.loadGraphModel('/models/manga-detector/model.json');
  return model;
}

// Khởi tạo Tesseract Worker
async function initTesseract() {
  const worker = await Tesseract.createWorker();
  await worker.loadLanguage('vie+jpn+chi_tra');
  await worker.initialize('vie+jpn+chi_tra');
  return worker;
}

// Nhận dạng text từ ảnh
async function recognizeText(imageData: ImageData): Promise<WorkerResult> {
  try {
    const worker = await initTesseract();
    const canvas = new OffscreenCanvas(imageData.width, imageData.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    ctx.putImageData(imageData, 0, 0);
    const result = await worker.recognize(canvas);
    
    return {
      success: true,
      result: result.data.text
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Phát hiện và cắt panel truyện
async function detectPanels(imageData: ImageData): Promise<WorkerResult> {
  try {
    // Convert image to tensor
    const tensor = tf.browser.fromPixels(imageData);
    
    // Áp dụng edge detection
    const edges = tf.tidy(() => {
      const grayscale = tf.image.rgbToGrayscale(tensor);
      const kernel = tf.tensor4d(
        new Float32Array([-1, -1, -1, -1, 8, -1, -1, -1, -1]),
        [3, 3, 1, 1]
      );
      return tf.conv2d(
        grayscale.expandDims(0),
        kernel,
        1,
        'same'
      );
    });

    // Chuyển về dạng contours
    const edgesData = await edges.data();
    edges.dispose();

    return {
      success: true,
      result: Array.from(edgesData)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Phân loại nội dung
async function classifyContent(text: string): Promise<WorkerResult> {
  try {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(text);
    
    // Phân tích sentiment
    const sentiment = await tf.tidy(() => {
      const encoded = tf.tensor1d(tokens.map(t => t.length));
      return encoded.mean().arraySync();
    });
    
    // Phân loại thể loại
    const genres = detectGenres(text);
    
    return {
      success: true,
      result: {
        tokens,
        type: detectMangaType(text),
        sentiment,
        nsfw: checkNSFW(text),
        genres,
        metadata: extractMetadata(text)
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Helper functions
function detectMangaType(text: string): string {
  const types = ['manga', 'manhwa', 'manhua', 'comic'];
  const scores = types.map(type => ({
    type,
    score: text.toLowerCase().split(type).length - 1
  }));
  return scores.reduce((a, b) => a.score > b.score ? a : b).type;
}

function detectGenres(text: string): string[] {
  const genreKeywords = {
    action: ['fight', 'battle', 'action', 'combat'],
    romance: ['love', 'romance', 'relationship'],
    fantasy: ['magic', 'fantasy', 'dragon'],
    // Thêm các genre khác
  };
  
  return Object.entries(genreKeywords)
    .filter(([_, keywords]) => 
      keywords.some(keyword => 
        text.toLowerCase().includes(keyword)
      )
    )
    .map(([genre]) => genre);
}

function checkNSFW(text: string): boolean {
  const nsfwKeywords = ['nsfw', 'adult', '18+'];
  return nsfwKeywords.some(k => text.toLowerCase().includes(k));
}

function extractMetadata(text: string): Record<string, string> {
  const patterns = {
    author: /Author:?\s*([^\n]+)/i,
    year: /Year:?\s*(\d{4})/i,
    status: /Status:?\s*([^\n]+)/i,
  };
  
  return Object.entries(patterns).reduce((meta, [key, pattern]) => {
    const match = text.match(pattern);
    if (match) {
      meta[key] = match[1].trim();
    }
    return meta;
  }, {} as Record<string, string>);
}

// Xử lý message từ main thread
self.addEventListener('message', async (e: MessageEvent) => {
  const { type, data } = e.data;

  try {
    let result: WorkerResult;
    switch (type) {
      case 'RECOGNIZE_TEXT':
        result = await recognizeText(data);
        break;
      case 'DETECT_PANELS':
        result = await detectPanels(data);
        break;
      case 'CLASSIFY_CONTENT':
        result = await classifyContent(data);
        break;
      default:
        throw new Error('Unknown command');
    }

    self.postMessage(result);
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
