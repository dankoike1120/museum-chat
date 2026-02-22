"use client";

import { useRef, useState, useCallback } from "react";

type Props = {
  onCapture: (imageBase64: string, mediaType: string) => void;
  loading: boolean;
};

export default function CameraCapture({ onCapture, loading }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [streamRef, setStreamRef] = useState<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamRef(stream);
        setStreaming(true);
      }
    } catch {
      alert("カメラへのアクセスが許可されていません");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef) {
      streamRef.getTracks().forEach((t) => t.stop());
      setStreamRef(null);
      setStreaming(false);
    }
  }, [streamRef]);

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
    const base64 = dataUrl.split(",")[1];
    stopCamera();
    onCapture(base64, "image/jpeg");
  }, [stopCamera, onCapture]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(",")[1];
      const mediaType = file.type || "image/jpeg";
      onCapture(base64, mediaType);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {streaming ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full max-w-md rounded-2xl shadow-lg"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="flex gap-3">
            <button
              onClick={takePhoto}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-full text-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
            >
              撮影する
            </button>
            <button
              onClick={stopCamera}
              className="border border-gray-300 px-6 py-3 rounded-full hover:bg-gray-50 transition-colors"
            >
              閉じる
            </button>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <div className="w-full aspect-square bg-gray-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
            <svg
              className="w-16 h-16 text-gray-400 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <p className="text-gray-500 text-center px-4">
              展示物の写真を撮影して
              <br />
              会話を始めましょう
            </p>
          </div>

          <button
            onClick={startCamera}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-full text-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
          >
            {loading ? "認識中..." : "カメラで撮影"}
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="w-full border border-gray-300 py-3 rounded-full text-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            写真を選択
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      )}
    </div>
  );
}
