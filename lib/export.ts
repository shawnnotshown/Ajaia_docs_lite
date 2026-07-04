import type { TiptapDocument, TiptapNode } from "@/types";

function serializeMarks(text: string, marks?: TiptapNode["marks"]): string {
  if (!marks?.length) {
    return text;
  }

  let result = text;
  for (const mark of marks) {
    if (mark.type === "bold" || mark.type === "strong") {
      result = `**${result}**`;
    } else if (mark.type === "italic" || mark.type === "em") {
      result = `*${result}*`;
    } else if (mark.type === "underline") {
      result = `<u>${result}</u>`;
    } else if (mark.type === "code") {
      result = `\`${result}\``;
    }
  }
  return result;
}

function serializeInline(nodes: TiptapNode[] = []): string {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        return serializeMarks(node.text || "", node.marks);
      }
      if (node.type === "hardBreak") {
        return "  \n";
      }
      return serializeInline(node.content);
    })
    .join("");
}

function serializeNode(node: TiptapNode): string {
  switch (node.type) {
    case "heading": {
      const level = Number(node.attrs?.level || 1);
      const hashes = "#".repeat(Math.min(Math.max(level, 1), 6));
      return `${hashes} ${serializeInline(node.content)}\n\n`;
    }
    case "paragraph":
      return `${serializeInline(node.content)}\n\n`;
    case "bulletList":
      return `${(node.content || [])
        .map((item) => serializeListItem(item, "-"))
        .join("")}\n`;
    case "orderedList":
      return `${(node.content || [])
        .map((item, index) => serializeListItem(item, `${index + 1}.`))
        .join("")}\n`;
    case "blockquote":
      return `${serializeInline(node.content)
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n")}\n\n`;
    case "codeBlock":
      return `\`\`\`\n${serializeInline(node.content)}\n\`\`\`\n\n`;
    case "horizontalRule":
      return "---\n\n";
    default:
      return serializeInline(node.content);
  }
}

function serializeListItem(node: TiptapNode, marker: string): string {
  const text = (node.content || [])
    .map((child) => {
      if (child.type === "paragraph") {
        return serializeInline(child.content);
      }
      return serializeNode(child).trim();
    })
    .join(" ");

  return `${marker} ${text}\n`;
}

export function tiptapToMarkdown(
  title: string,
  content: TiptapDocument
): string {
  const body = (content.content || []).map(serializeNode).join("").trim();
  return `# ${title}\n\n${body}\n`;
}

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function safeFilename(title: string): string {
  return (
    title
      .trim()
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80) || "document"
  );
}

export function exportAsMarkdown(
  title: string,
  content: TiptapDocument
): void {
  const markdown = tiptapToMarkdown(title, content);
  downloadTextFile(
    `${safeFilename(title)}.md`,
    markdown,
    "text/markdown;charset=utf-8"
  );
}

export function exportAsPDF(title: string): void {
  const previousTitle = document.title;
  document.title = title;
  document.body.classList.add("printing-document");
  window.print();
  document.body.classList.remove("printing-document");
  document.title = previousTitle;
}
