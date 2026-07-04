"use client";

import { useEffect, useRef, useState } from "react";
import type { TiptapDocument } from "@/types";
import { exportAsMarkdown, exportAsPDF } from "@/lib/export";

interface ExportMenuProps {
  title: string;
  content: TiptapDocument;
}

export default function ExportMenu({ title, content }: ExportMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleClick = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Export
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              exportAsMarkdown(title, content);
              setOpen(false);
            }}
            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            Export as Markdown
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              exportAsPDF(title);
              setOpen(false);
            }}
            className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
          >
            Export as PDF
          </button>
        </div>
      )}
    </div>
  );
}
