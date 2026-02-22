"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ObjectRecord } from "@/lib/supabase";

export default function AdminPage() {
  const [objects, setObjects] = useState<ObjectRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/objects")
      .then((res) => res.json())
      .then((data) => {
        setObjects(data);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`「${name}」を削除しますか？`)) return;

    const res = await fetch("/api/objects", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      setObjects((prev) => prev.filter((o) => o.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">立体物管理</h1>
          <Link
            href="/admin/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + 新規登録
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">読み込み中...</p>
        ) : objects.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>登録された立体物はありません</p>
            <Link
              href="/admin/new"
              className="text-blue-600 hover:underline mt-2 inline-block"
            >
              最初の立体物を登録する
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {objects.map((obj) => (
              <div
                key={obj.id}
                className="bg-white rounded-lg shadow-sm border p-4 flex items-center gap-4"
              >
                <div className="flex gap-2 shrink-0">
                  {obj.image_urls.slice(0, 3).map((url, i) => (
                    <Image
                      key={i}
                      src={url}
                      alt={`${obj.name} view ${i + 1}`}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded"
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-gray-900">{obj.name}</h2>
                  <p className="text-sm text-gray-500 truncate">{obj.tone}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/admin/${obj.id}/edit`}
                    className="text-blue-600 hover:text-blue-800 text-sm px-3 py-1 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(obj.id, obj.name)}
                    className="text-red-600 hover:text-red-800 text-sm px-3 py-1 border border-red-200 rounded hover:bg-red-50 transition-colors"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
