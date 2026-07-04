"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { createDocument } from "@/lib/documents";
import {
  fileToTiptapJSON,
  getTitleFromFileName,
  validateFile,
} from "@/lib/fileImport";

export default function ImportButton() {
  const router = useRouter();
  const { activeUser } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setError(null);
    inputRef.current?.click();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error ?? "Invalid file.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const document = await createDocument(activeUser.id, {
        title: getTitleFromFileName(file.name),
        content_json: fileToTiptapJSON(text),
      });
      router.push(`/documents/${document.id}`);
    } catch {
      setError("Unable to import file. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        className="hidden"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Importing…" : "Import File"}
      </button>
      {error && <p className="mt-1 max-w-[16rem] text-sm text-red-600">{error}</p>}
    </div>
  );
}
