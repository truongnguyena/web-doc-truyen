import { useCallback, useEffect, useRef } from 'react';

interface AIWorkerResult {
  success: boolean;
  result?: any;
  error?: string;
}

export function useAIProcessing() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    // Khởi tạo worker
    workerRef.current = new Worker(
      new URL('../lib/workers/ai.worker.ts', import.meta.url)
    );

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

  const processImage = useCallback(async (
    imageData: ImageData,
    type: 'RECOGNIZE_TEXT' | 'DETECT_PANELS'
  ): Promise<AIWorkerResult> => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve({ success: false, error: 'Worker not initialized' });
        return;
      }

      const handleMessage = (e: MessageEvent<AIWorkerResult>) => {
        workerRef.current?.removeEventListener('message', handleMessage);
        resolve(e.data);
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type, data: imageData });
    });
  }, []);

  const classifyContent = useCallback(async (text: string): Promise<AIWorkerResult> => {
    return new Promise((resolve) => {
      if (!workerRef.current) {
        resolve({ success: false, error: 'Worker not initialized' });
        return;
      }

      const handleMessage = (e: MessageEvent<AIWorkerResult>) => {
        workerRef.current?.removeEventListener('message', handleMessage);
        resolve(e.data);
      };

      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ type: 'CLASSIFY_CONTENT', data: text });
    });
  }, []);

  return {
    processImage,
    classifyContent,
  };
}
