import { describe, expect, it } from "vitest";
import {
  fileToTiptapJSON,
  getTitleFromFileName,
  validateFile,
} from "@/lib/fileImport";

function makeFile(name: string, sizeBytes: number): File {
  return { name, size: sizeBytes } as File;
}

describe("validateFile", () => {
  it("accepts .txt and .md files under 1 MB", () => {
    expect(validateFile(makeFile("notes.txt", 100)).valid).toBe(true);
    expect(validateFile(makeFile("readme.md", 100)).valid).toBe(true);
  });

  it("rejects unsupported file types", () => {
    const docx = validateFile(makeFile("report.docx", 100));
    const pdf = validateFile(makeFile("report.pdf", 100));

    expect(docx.valid).toBe(false);
    expect(docx.error).toMatch(/unsupported file type/i);
    expect(pdf.valid).toBe(false);
  });

  it("rejects files larger than 1 MB", () => {
    const result = validateFile(makeFile("big.txt", 1 * 1024 * 1024 + 1));
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/maximum upload size of 1 MB/i);
  });
});

describe("getTitleFromFileName", () => {
  it("strips the extension from the file name", () => {
    expect(getTitleFromFileName("Meeting Notes.txt")).toBe("Meeting Notes");
    expect(getTitleFromFileName("agenda.md")).toBe("agenda");
  });
});

describe("fileToTiptapJSON", () => {
  it("converts plain text into paragraph nodes", () => {
    const json = fileToTiptapJSON("Hello\nWorld");
    expect(json.type).toBe("doc");
    expect(json.content).toHaveLength(2);
    expect(json.content[0]).toMatchObject({
      type: "paragraph",
      content: [{ type: "text", text: "Hello" }],
    });
  });
});
