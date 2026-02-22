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
      <div className="h-dvh flex flex-col bg-dark">
        <ChatWindow object={identifiedObject} onReset={handleReset} />
      </div>
    );
  }

  // Capture phase
  return (
    <div className="min-h-dvh bg-dark flex flex-col items-center justify-center p-6">
      <div className="text-center mb-10">
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-gold tracking-wider uppercase mb-2">
          Museum Chat
        </h1>
        <p className="text-text-secondary text-sm tracking-wide">
          展示物を撮影して会話しよう
        </p>
      </div>

      <CameraCapture onCapture={handleCapture} loading={loading} />

      {error && (
        <div className="mt-4 bg-dark-card border border-red-900/50 text-red-400 px-4 py-3 rounded-lg text-sm max-w-md w-full text-center">
          {error}
        </div>
      )}
    </div>
  );
}
