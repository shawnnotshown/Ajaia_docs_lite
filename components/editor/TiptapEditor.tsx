"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { useEffect } from "react";
import type { TiptapDocument } from "@/types";
import EditorToolbar from "@/components/editor/EditorToolbar";

interface TiptapEditorProps {
  content: TiptapDocument;
  onChange: (content: TiptapDocument) => void;
  editable?: boolean;
}

export default function TiptapEditor({
  content,
  onChange,
  editable = true,
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
    ],
    content,
    editable,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-slate max-w-none min-h-[420px] px-8 py-6 focus:outline-none",
      },
    },
    onUpdate: ({ editor: current }) => {
      onChange(current.getJSON() as TiptapDocument);
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }
    editor.setEditable(editable);
  }, [editor, editable]);

  return (
    <div
      id="document-print-area"
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
    >
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
