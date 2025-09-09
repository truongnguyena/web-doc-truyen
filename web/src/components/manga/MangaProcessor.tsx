import React, { useCallback, useRef, useState } from 'react';
import { useAIProcessing } from '@/hooks/useAIProcessing';

interface MangaProcessorProps {
  onProcess: (result: {
    text: string;
    panels: number[];
    classification: {
      type: string;
      nsfw: boolean;
    };
  }) => void;
}

export function MangaProcessor({ onProcess }: MangaProcessorProps) {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const { processImage, classifyContent } = useAIProcessing();

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    setProgress(0);

    try {
      // Tạo ImageData từ file
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Failed to get canvas context');

      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Xử lý text
      setProgress(30);
      const textResult = await processImage(imageData, 'RECOGNIZE_TEXT');
      if (!textResult.success) throw new Error(textResult.error);

      // Phát hiện panels
      setProgress(60);
      const panelsResult = await processImage(imageData, 'DETECT_PANELS');
      if (!panelsResult.success) throw new Error(panelsResult.error);

      // Phân loại nội dung
      setProgress(90);
      const classificationResult = await classifyContent(textResult.result);
      if (!classificationResult.success) throw new Error(classificationResult.error);

      onProcess({
        text: textResult.result,
        panels: panelsResult.result,
        classification: classificationResult.result,
      });

      setProgress(100);
    } catch (error) {
      console.error('Processing failed:', error);
      // Thêm xử lý lỗi ở đây
    } finally {
      setProcessing(false);
    }
  }, [processImage, classifyContent, onProcess]);

  return (
    <div className="p-4 border rounded-lg">
      <input
        type="file"
        ref={fileRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={processing}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {processing ? 'Processing...' : 'Upload Manga Page'}
      </button>
      {processing && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Processing: {progress}%
          </p>
        </div>
      )}
    </div>
  );
}
