import type { TiptapDocument, TiptapNode } from "@/types";

const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1 MB
const ALLOWED_EXTENSIONS = [".txt", ".md"];

export function validateFile(file: File): { valid: boolean; error?: string } {
  const name = file.name.toLowerCase();
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) =>
    name.endsWith(ext)
  );

  if (!hasAllowedExtension) {
    return {
      valid: false,
      error: "Unsupported file type. Please import a .txt or .md file.",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "File exceeds the maximum upload size of 1 MB.",
    };
  }

  return { valid: true };
}

export function getTitleFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.(txt|md)$/i, "").trim();
  return withoutExtension || "Untitled Document";
}

/**
 * Converts plain text / markdown-ish content into Tiptap JSON.
 * Preserves paragraphs and basic markdown headings/lists when present.
 */
export function fileToTiptapJSON(text: string): TiptapDocument {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const content: TiptapNode[] = [];

  let bulletItems: TiptapNode[] = [];
  let orderedItems: TiptapNode[] = [];

  const flushLists = () => {
    if (bulletItems.length) {
      content.push({ type: "bulletList", content: bulletItems });
      bulletItems = [];
    }
    if (orderedItems.length) {
      content.push({ type: "orderedList", content: orderedItems });
      orderedItems = [];
    }
  };

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,2})\s+(.+)$/);
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    const orderedMatch = line.match(/^\d+\.\s+(.+)$/);

    if (headingMatch) {
      flushLists();
      const level = headingMatch[1].length;
      content.push({
        type: "heading",
        attrs: { level },
        content: [{ type: "text", text: headingMatch[2] }],
      });
      continue;
    }

    if (bulletMatch) {
      if (orderedItems.length) flushLists();
      bulletItems.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: bulletMatch[1] }],
          },
        ],
      });
      continue;
    }

    if (orderedMatch) {
      if (bulletItems.length) flushLists();
      orderedItems.push({
        type: "listItem",
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: orderedMatch[1] }],
          },
        ],
      });
      continue;
    }

    flushLists();

    if (line.trim() === "") {
      content.push({ type: "paragraph" });
    } else {
      content.push({
        type: "paragraph",
        content: [{ type: "text", text: line }],
      });
    }
  }

  flushLists();

  if (content.length === 0) {
    content.push({ type: "paragraph" });
  }

  return { type: "doc", content };
}
