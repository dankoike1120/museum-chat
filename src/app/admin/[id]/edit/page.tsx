"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ObjectForm from "@/components/admin/ObjectForm";
import type { ObjectRecord } from "@/lib/supabase";

export default function EditObjectPage() {
  const params = useParams();
  const [object, setObject] = useState<ObjectRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/objects?id=${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setObject(data);
        setLoading(false);
      });
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark p-6">
        <p className="text-text-muted">読み込み中...</p>
      </div>
    );
  }

  if (!object) {
    return (
      <div className="min-h-screen bg-dark p-6">
        <p className="text-red-400">立体物が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-gold tracking-wider mb-6">
          「{object.name}」を編集
        </h1>
        <ObjectForm object={object} />
      </div>
    </div>
  );
}
