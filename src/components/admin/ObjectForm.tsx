"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import type { ObjectRecord } from "@/lib/supabase";

type Props = {
  object?: ObjectRecord;
};

export default function ObjectForm({ object }: Props) {
  const router = useRouter();
  const [name, setName] = useState(object?.name || "");
  const [tone, setTone] = useState(object?.tone || "");
  const [knowledge, setKnowledge] = useState(object?.knowledge || "");
  const [questions, setQuestions] = useState<string[]>(
    object?.suggested_questions || ["", "", ""]
  );
  const [files, setFiles] = useState<(File | null)[]>([null, null, null]);
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (index: number, file: File | null) => {
    setFiles((prev) => {
      const next = [...prev];
      next[index] = file;
      return next;
    });
  };

  const handleQuestionChange = (index: number, value: string) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    if (object) formData.append("id", object.id);
    formData.append("name", name);
    formData.append("tone", tone);
    formData.append("knowledge", knowledge);
    formData.append(
      "suggested_questions",
      JSON.stringify(questions.filter((q) => q.trim()))
    );

    files.forEach((file, i) => {
      if (file) {
        formData.append(`image_${i}`, file);
      }
    });

    // Pass existing image URLs for edit mode
    if (object) {
      object.image_urls.forEach((url, i) => {
        formData.append(`existing_image_${i}`, url);
      });
    }

    const res = await fetch("/api/objects", {
      method: object ? "PUT" : "POST",
      body: formData,
    });

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      const err = await res.json();
      alert(`エラー: ${err.error}`);
    }

    setSaving(false);
  };

  const labels = ["正面", "側面", "背面"];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          立体物名 *
        </label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: 縄文土器"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          写真（3視点） *
        </label>
        <div className="flex gap-4">
          {labels.map((label, i) => (
            <ImageUploader
              key={i}
              index={i}
              label={label}
              existingUrl={object?.image_urls[i]}
              onFileSelect={handleFileSelect}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          会話のトンマナ（キャラクター設定）
        </label>
        <textarea
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          rows={3}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例: 古風な口調で話す。「〜でござる」などの語尾を使う。"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          事前情報/ナレッジ
        </label>
        <textarea
          value={knowledge}
          onChange={(e) => setKnowledge(e.target.value)}
          rows={6}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="この立体物に関する詳しい情報を入力してください..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          初回の質問選択肢（最大3つ）
        </label>
        {questions.map((q, i) => (
          <input
            key={i}
            type="text"
            value={q}
            onChange={(e) => handleQuestionChange(i, e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`質問 ${i + 1}`}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {saving ? "保存中..." : object ? "更新する" : "登録する"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  );
}
