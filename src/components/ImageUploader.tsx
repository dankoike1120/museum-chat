"use client";

import { useRef, useState } from "react";
import Image from "next/image";

type Props = {
  index: number;
  label: string;
  existingUrl?: string;
  onFileSelect: (index: number, file: File | null) => void;
};

export default function ImageUploader({
  index,
  label,
  existingUrl,
  onFileSelect,
}: Props) {
  const [preview, setPreview] = useState<string | null>(existingUrl || null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      onFileSelect(index, file);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-32 h-32 border border-dark-border rounded-lg flex items-center justify-center overflow-hidden hover:border-gold/50 transition-all duration-200 bg-dark-secondary"
      >
        {preview ? (
          <Image
            src={preview}
            alt={label}
            width={128}
            height={128}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-text-muted text-3xl">+</span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
