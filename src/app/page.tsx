"use client";

import { useState } from "react";
import CameraCapture from "@/components/CameraCapture";
import ChatWindow from "@/components/ChatWindow";
import type { ObjectRecord } from "@/lib/supabase";

export default function Home() {
  const [identifiedObject, setIdentifiedObject] = useState<ObjectRecord | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = async (imageBase64: string, mediaType: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageBase64, mediaType }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "認識に失敗しました");
        setLoading(false);
        return;
      }

      const object = await res.json();
      setIdentifiedObject(object);
    } catch {
      setError("通信エラーが発生しました");
    }

    setLoading(false);
  };

  const handleReset = () => {
    setIdentifiedObject(null);
    setError(null);
  };

  // Chat phase
  if (identifiedObject) {
    return (
      <div className="h-dvh flex flex-col">
        <ChatWindow object={identifiedObject} onReset={handleReset} />
      </div>
    );
  }

  // Capture phase
  return (
    <div className="min-h-dvh bg-gradient-to-b from-blue-50 to-white flex flex-col items-center justify-center p-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Museum Chat</h1>
        <p className="text-gray-600">展示物を撮影して会話しよう</p>
      </div>

      <CameraCapture onCapture={handleCapture} loading={loading} />

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm max-w-md w-full text-center">
          {error}
        </div>
      )}
    </div>
  );
}
