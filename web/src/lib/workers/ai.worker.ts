import * as tf from '@tensorflow/tfjs';
import Tesseract from 'tesseract.js';
import natural from 'natural';

let worker: Tesseract.Worker | null = null;

// Khởi tạo Tesseract Worker
async function initTesseract() {
  if (!worker) {
    worker = await Tesseract.createWorker('vie+jpn+chi_tra');
  }
  return worker;
}

// Nhận dạng text từ ảnh
async function recognizeText(imageData: ImageData) {
  const worker = await initTesseract();
  const result = await worker.recognize(imageData);
  return result.text;
}

// Phát hiện và cắt panel truyện
async function detectPanels(imageData: ImageData) {
  // Convert image to tensor
  const tensor = tf.browser.fromPixels(imageData);
  
  // Áp dụng edge detection
  const edges = tf.tidy(() => {
    const grayscale = tf.image.rgbToGrayscale(tensor);
    return tf.conv2d(
      grayscale.expandDims(),
      tf.tensor4d([[-1, -1, -1], [-1, 8, -1], [-1, -1, -1]], [3, 3, 1, 1]),
      1,
      'same'
    );
  });

  // Chuyển về dạng contours
  const edgesData = await edges.data();
  return edgesData;
}

// Phân loại nội dung
function classifyContent(text: string) {
  const tokenizer = new natural.WordTokenizer();
  const tokens = tokenizer.tokenize(text);
  
  // Thêm logic phân loại ở đây
  return {
    tokens,
    type: 'manga', // hoặc 'comic', 'text', etc.
    nsfw: false, // flag nội dung người lớn
  };
}

// Xử lý message từ main thread
self.addEventListener('message', async (e: MessageEvent) => {
  const { type, data } = e.data;

  try {
    let result;
    switch (type) {
      case 'RECOGNIZE_TEXT':
        result = await recognizeText(data);
        break;
      case 'DETECT_PANELS':
        result = await detectPanels(data);
        break;
      case 'CLASSIFY_CONTENT':
        result = classifyContent(data);
        break;
      default:
        throw new Error('Unknown command');
    }

    self.postMessage({ success: true, result });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
});
