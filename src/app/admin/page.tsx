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
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-gold tracking-wider uppercase">
            立体物管理
          </h1>
          <Link
            href="/admin/new"
            className="bg-gold text-dark px-5 py-2 rounded-lg font-semibold hover:bg-gold-dark transition-all duration-200"
          >
            + 新規登録
          </Link>
        </div>

        {loading ? (
          <p className="text-text-muted">読み込み中...</p>
        ) : objects.length === 0 ? (
          <div className="text-center py-12 text-text-muted">
            <p>登録された立体物はありません</p>
            <Link
              href="/admin/new"
              className="text-gold hover:text-gold-light mt-2 inline-block"
            >
              最初の立体物を登録する
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {objects.map((obj) => (
              <div
                key={obj.id}
                className="bg-dark-card rounded-lg border border-dark-border p-4 flex items-center gap-4 hover:border-gold/20 transition-all duration-200"
              >
                <div className="flex gap-2 shrink-0">
                  {obj.image_urls.slice(0, 3).map((url, i) => (
                    <Image
                      key={i}
                      src={url}
                      alt={`${obj.name} view ${i + 1}`}
                      width={64}
                      height={64}
                      className="w-16 h-16 object-cover rounded border border-dark-border"
                    />
                  ))}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-semibold text-text-primary">{obj.name}</h2>
                  <p className="text-sm text-text-muted truncate">{obj.tone}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    href={`/admin/${obj.id}/edit`}
                    className="text-gold hover:text-gold-light text-sm px-3 py-1 border border-gold/30 rounded hover:bg-gold/10 transition-all duration-200"
                  >
                    編集
                  </Link>
                  <button
                    onClick={() => handleDelete(obj.id, obj.name)}
                    className="text-red-400 hover:text-red-300 text-sm px-3 py-1 border border-red-900/30 rounded hover:bg-red-900/20 transition-all duration-200"
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
