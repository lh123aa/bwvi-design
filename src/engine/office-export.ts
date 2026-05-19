/**
 * office-export.ts — WKHTML/Office 导出（PPTX + DOCX）
 *
 * 支持样式感知的 HTML→Office 转换，每 <section> 对应一页幻灯片。
 * ZIP 使用 Node.js 原生 zlib 实现，跨平台兼容，零外部依赖。
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { deflateSync } from "node:zlib";

type Format = "pptx" | "docx";

// ─── 入口 ────────────────────────────────────────────────────────────────────

export async function exportOffice(
  htmlPath: string,
  format: Format,
  outputPath: string,
): Promise<{ file: string; slides?: number; warnings: string[] }> {
  const warnings: string[] = [];
  const html = readFileSync(htmlPath, "utf-8");
  const sections = parseSections(html);

  if (sections.length === 0) {
    warnings.push("HTML 中未找到 <section>，使用全文作为单页");
  }

  if (format === "docx") {
    return exportDocx(sections, html, outputPath, warnings);
  }
  return exportPptx(sections, html, outputPath, warnings);
}

// ─── HTML 解析 ───────────────────────────────────────────────────────────────

interface ParsedSection {
  title: string;
  tag: string;
  content: { tag: string; text: string; style: Record<string, string> }[];
  bgColor: string | null;
  textColor: string | null;
}

function parseSections(html: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const sectionRe = /<section[^>]*>([\s\S]*?)<\/section\s*>/gi;
  let m: RegExpExecArray | null;

  while ((m = sectionRe.exec(html)) !== null) {
    const sectionHtml = m[1];
    const sectionsMatch = m[0].match(/<section([^>]*)>/);
    const sectionAttrs = sectionsMatch ? parseStyle(String(sectionsMatch[1])) : {};
    const bgColor = extractColor(sectionAttrs["style"] || "");
    const textColor = null;

    const items: ParsedSection["content"] = [];
    let title = "";
    let titleTag = "h1";

    const tagRe = /<(h[1-4]|p|li|blockquote)([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
    let tm: RegExpExecArray | null;
    while ((tm = tagRe.exec(sectionHtml)) !== null) {
      const tag = tm[1].toLowerCase();
      const attrs = parseStyle(tm[2]);
      const styleStr = attrs["style"] || "";
      const text = stripHtml(tm[3]).trim();
      if (!text) continue;

      const style: Record<string, string> = {};
      const parsed = parseStyle(styleStr);
      if (parsed.color) style.color = parsed.color;
      if (parsed["font-size"]) style["font-size"] = parsed["font-size"];
      if (parsed["font-weight"]) style["font-weight"] = parsed["font-weight"];
      if (parsed["text-align"]) style["text-align"] = parsed["text-align"];

      if (tag.startsWith("h") && !title) {
        title = text;
        titleTag = tag;
      }

      items.push({ tag, text, style });
    }

    sections.push({ title, tag: titleTag, content: items, bgColor, textColor });
  }

  return sections;
}

function parseStyle(attrStr: string): Record<string, string> {
  const result: Record<string, string> = {};
  // Extract style="..."
  const styleMatch = attrStr.match(/style\s*=\s*"([^"]*)"/i);
  if (!styleMatch) return result;
  for (const decl of styleMatch[1].split(";")) {
    const parts = decl.split(":").map((s) => s.trim());
    if (parts.length === 2) {
      result[parts[0].toLowerCase()] = parts[1];
    }
  }
  return result;
}

function extractColor(styleStr: string): string | null {
  // Match background, background-color, or linear-gradient
  const bgMatch = styleStr.match(/background(?:-color)?\s*:\s*([^;]+)/i);
  if (bgMatch) {
    const val = bgMatch[1].trim();
    // Extract hex color from gradient if needed
    const hexMatch = val.match(/#[0-9a-fA-F]{3,8}/);
    if (hexMatch) return hexMatch[0];
    // Named colors
    const named: Record<string, string> = {
      black: "#000000", white: "#FFFFFF", transparent: "transparent",
    };
    if (named[val]) return named[val];
  }
  return null;
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function extractTitle(html: string): string {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : "BWVI Export";
}

// ─── 跨平台 ZIP（Node.js 原生实现） ──────────────────────────────────────────

function zipDir(dir: string, output: string): void {
  const entries: { name: string; data: Buffer }[] = [];
  collectFiles(dir, "", entries);
  const central: Buffer[] = [];
  const localOffsets: number[] = [];
  const localData: Buffer[] = [];

  for (const entry of entries) {
    const nameBytes = Buffer.from(entry.name, "utf-8");
    const compressed = entry.name.endsWith(".xml") || entry.name.endsWith(".rels")
      ? deflateSync(entry.data, { level: 6 })
      : entry.data;

    // Local file header
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4);          // version needed
    localHeader.writeUInt16LE(0x0800, 6);       // flags (data descriptor)
    localHeader.writeUInt16LE(entry.name.endsWith(".xml") || entry.name.endsWith(".rels") ? 8 : 0, 8); // compression
    localHeader.writeUInt16LE(0, 10);           // mod time
    localHeader.writeUInt16LE(0, 12);           // mod date
    const crc = crc32(entry.data);
    localHeader.writeUInt32LE(crc, 14);         // crc-32
    localHeader.writeUInt32LE(compressed.length, 18); // compressed size
    localHeader.writeUInt32LE(entry.data.length, 22); // uncompressed size
    localHeader.writeUInt16LE(nameBytes.length, 26);  // file name length
    localHeader.writeUInt16LE(0, 28);           // extra field length

    localOffsets.push(Buffer.concat(localData).length);
    localData.push(localHeader);
    localData.push(nameBytes);
    localData.push(compressed);

    // Central directory entry
    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0); // signature
    centralHeader.writeUInt16LE(20, 4);          // version made by
    centralHeader.writeUInt16LE(20, 6);          // version needed
    centralHeader.writeUInt16LE(0x0800, 8);       // flags
    centralHeader.writeUInt16LE(entry.name.endsWith(".xml") || entry.name.endsWith(".rels") ? 8 : 0, 10); // compression
    centralHeader.writeUInt16LE(0, 12);           // mod time
    centralHeader.writeUInt16LE(0, 14);           // mod date
    centralHeader.writeUInt32LE(crc, 16);         // crc-32
    centralHeader.writeUInt32LE(compressed.length, 20); // compressed size
    centralHeader.writeUInt32LE(entry.data.length, 24);  // uncompressed size
    centralHeader.writeUInt16LE(nameBytes.length, 28);   // file name length
    centralHeader.writeUInt16LE(0, 30);           // extra field length
    centralHeader.writeUInt16LE(0, 32);           // file comment length
    centralHeader.writeUInt16LE(0, 34);           // disk number start
    centralHeader.writeUInt16LE(0, 36);           // internal file attributes
    centralHeader.writeUInt32LE(0, 38);           // external file attributes
    centralHeader.writeUInt32LE(localOffsets[localOffsets.length - 1], 42); // relative offset
    central.push(centralHeader);
    central.push(nameBytes);
  }

  const centralData = Buffer.concat(central);
  const localDataFull = Buffer.concat(localData);

  // End of central directory
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);  // signature
  eocd.writeUInt16LE(0, 4);           // disk number
  eocd.writeUInt16LE(0, 6);           // disk with central directory
  eocd.writeUInt16LE(entries.length, 8);  // total entries on this disk
  eocd.writeUInt16LE(entries.length, 10); // total entries
  eocd.writeUInt32LE(centralData.length, 12); // central directory size
  eocd.writeUInt32LE(localDataFull.length, 16); // offset of central directory
  eocd.writeUInt16LE(0, 20);          // comment length

  writeFileSync(output, Buffer.concat([localDataFull, centralData, eocd]));
}

function collectFiles(dir: string, prefix: string, entries: { name: string; data: Buffer }[]): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const entryName = prefix ? prefix + "/" + name : name;
    if (statSync(full).isDirectory()) {
      collectFiles(full, entryName, entries);
    } else {
      entries.push({ name: entryName, data: readFileSync(full) });
    }
  }
}

// ─── CRC-32 ──────────────────────────────────────────────────────────────────

const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC32_TABLE[i] = c;
}

function crc32(buf: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC32_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ─── 文本辅助 ────────────────────────────────────────────────────────────────

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── DOCX 导出 ───────────────────────────────────────────────────────────────

async function exportDocx(
  sections: ParsedSection[],
  html: string,
  output: string,
  warnings: string[],
): Promise<{ file: string; warnings: string[] }> {
  const title = sections.length > 0 ? sections[0].title : extractTitle(html) || "BWVI Export";
  const allItems = sections.flatMap((s) => s.content);
  if (allItems.length === 0) {
    allItems.push({ tag: "p", text: title, style: {} });
  }

  const paragraphs = allItems
    .map((item) => {
      const isHeading = item.tag.startsWith("h");
      const styleId = item.tag === "h1" ? "Title" : item.tag === "h2" ? "Heading1" : item.tag === "h3" ? "Heading2" : "Normal";
      const color = item.style.color ? ` <w:color w:val="${item.style.color.replace("#", "")}"/>` : "";
      const fontSize = item.style["font-size"] ? ` <w:sz w:val="${Math.round(parseFloat(item.style["font-size"]) * 2)}"/>` : "";
      const bold = isHeading || item.style["font-weight"] === "bold" || item.style["font-weight"] === "700"
        ? " <w:b/>" : "";
      const rPr = color || fontSize || bold
        ? `<w:rPr>${bold}${color}${fontSize}</w:rPr>`
        : "";
      return `<w:p><w:pPr><w:pStyle w:val="${styleId}"/></w:pPr><w:r>${rPr}<w:t>${escapeXml(item.text)}</w:t></w:r></w:p>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${paragraphs}</w:body></w:document>`;

  const tmpDir = join(tmpdir(), `bwvi-docx-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  mkdirSync(join(tmpDir, "word"), { recursive: true });
  mkdirSync(join(tmpDir, "_rels"), { recursive: true });
  mkdirSync(join(tmpDir, "word/_rels"), { recursive: true });

  writeFileSync(
    join(tmpDir, "[Content_Types].xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`,
    "utf-8",
  );
  writeFileSync(
    join(tmpDir, "_rels/.rels"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    "utf-8",
  );
  writeFileSync(
    join(tmpDir, "word/_rels/document.xml.rels"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
    "utf-8",
  );
  writeFileSync(
    join(tmpDir, "word/styles.xml"),
    `<?xml version="1.0"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="22"/><w:color w:val="333333"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="44"/><w:color w:val="1A1A2E"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="2563EB"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:rPr><w:b/><w:sz w:val="28"/><w:color w:val="333333"/></w:rPr></w:style></w:styles>`,
    "utf-8",
  );
  writeFileSync(join(tmpDir, "word/document.xml"), xml, "utf-8");

  zipDir(tmpDir, output);
  warnings.push(`DOCX 已生成（${allItems.length} 段，含内联样式）`);
  return { file: output, warnings };
}

// ─── PPTX 导出 ───────────────────────────────────────────────────────────────

async function exportPptx(
  sections: ParsedSection[],
  html: string,
  output: string,
  warnings: string[],
): Promise<{ file: string; slides?: number; warnings: string[] }> {
  const title = extractTitle(html);
  // 每个 section 一页；无 section 时用全文创建一个单页
  const slides: { title: string; items: ParsedSection["content"]; bg: string | null }[] = [];

  if (sections.length === 0) {
    const text = extractSimpleText(html);
    slides.push({
      title,
      items: text.map((t) => ({ tag: "p" as const, text: t, style: {} })),
      bg: null,
    });
  } else {
    for (const sec of sections) {
      slides.push({ title: sec.title, items: sec.content, bg: sec.bgColor });
    }
  }

  const tmpDir = join(tmpdir(), `bwvi-pptx-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  mkdirSync(join(tmpDir, "_rels"), { recursive: true });
  mkdirSync(join(tmpDir, "ppt"), { recursive: true });
  mkdirSync(join(tmpDir, "ppt/slides"), { recursive: true });
  mkdirSync(join(tmpDir, "ppt/slides/_rels"), { recursive: true });
  mkdirSync(join(tmpDir, "ppt/slideMasters"), { recursive: true });
  mkdirSync(join(tmpDir, "ppt/slideLayouts"), { recursive: true });
  mkdirSync(join(tmpDir, "ppt/theme"), { recursive: true });
  mkdirSync(join(tmpDir, "ppt/_rels"), { recursive: true });
  mkdirSync(join(tmpDir, "docProps"), { recursive: true });

  // [Content_Types].xml
  let types =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>`;
  slides.forEach((_, i) => {
    types += `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`;
  });
  types += `</Types>`;
  writeFileSync(join(tmpDir, "[Content_Types].xml"), types, "utf-8");

  // _rels/.rels
  writeFileSync(
    join(tmpDir, "_rels/.rels"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`,
    "utf-8",
  );

  // presentation.xml
  const slideRefs = slides.map((_, i) => `<p:sldId id="${i + 256}" r:id="rId${i + 2}"/>`).join("");
  writeFileSync(
    join(tmpDir, "ppt/presentation.xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${slideRefs}</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`,
    "utf-8",
  );

  // ppt/_rels/presentation.xml.rels
  let presRels =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>`;
  slides.forEach((_, i) => {
    presRels += `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`;
  });
  presRels += `</Relationships>`;
  writeFileSync(join(tmpDir, "ppt/_rels/presentation.xml.rels"), presRels, "utf-8");

  // slideMaster + slideLayout + theme
  writeFileSync(
    join(tmpDir, "ppt/slideMasters/slideMaster1.xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:nvPr/><p:cNvPr id="1" name=""/><p:nvGrpSpPr/></p:nvGrpSpPr></p:spTree></p:cSld></p:sldMaster>`,
    "utf-8",
  );
  writeFileSync(
    join(tmpDir, "ppt/slideLayouts/slideLayout1.xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:nvGrpSpPr/></p:nvGrpSpPr></p:spTree></p:cSld></p:sldLayout>`,
    "utf-8",
  );
  writeFileSync(
    join(tmpDir, "ppt/theme/theme1.xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="BWVI"><a:themeElements><a:clrScheme name="BWVI"><a:dk1><a:srgbClr val="333333"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:accent1><a:srgbClr val="2563EB"/></a:accent1></a:clrScheme><a:fontScheme name="BWVI"><a:majorFont><a:latin typeface="Inter"/></a:majorFont><a:minorFont><a:latin typeface="Inter"/></a:minorFont></a:fontScheme><a:fmtScheme name="BWVI"/></a:themeElements></a:theme>`,
    "utf-8",
  );
  writeFileSync(
    join(tmpDir, "docProps/app.xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Slides>${slides.length}</Slides></Properties>`,
    "utf-8",
  );
  writeFileSync(
    join(tmpDir, "docProps/core.xml"),
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"><dc:title>${escapeXml(title)}</dc:title></cp:coreProperties>`,
    "utf-8",
  );

  // Slides — 每个 section 一页，带背景色和结构化排版
  slides.forEach((slide, idx) => {
    const bgXml = slide.bg && slide.bg !== "transparent"
      ? `<p:bg><p:bgPr><a:solidFill><a:srgbClr val="${slide.bg.replace("#", "")}"/></a:solidFill></p:bgPr></p:bg>`
      : "";

    // 标题放在上方（如果存在）
    const titleEl = slide.title
      ? `<p:sp><p:nvSpPr><p:cNvPr id="1" name="Title"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="457200"/><a:ext cx="9906000" cy="914400"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr><p:txBody><a:bodyPr wrap="none"/><a:lstStyle/><a:p><a:rPr sz="3600" b="1" srgbClr="${slide.bg ? "FFFFFF" : "1A1A2E"}"/><a:t>${escapeXml(slide.title)}</a:t></a:p></p:txBody></p:sp>`
      : "";

    // 正文（最多 6 行，避免拥挤）
    const bodyItems = slide.items.slice(0, 6);
    const bodyEls = bodyItems
      .map((item, i) => {
        const yPos = 1600000 + i * 600000;
        const isHeading = item.tag.startsWith("h");
        const fontSize = isHeading ? 2400 : 1800;
        const bold = isHeading ? `<a:rPr sz="${fontSize}" b="1"/>` : `<a:rPr sz="${fontSize}"/>`;
        return `<p:sp><p:nvSpPr><p:cNvPr id="${i + 2}" name="Text${i + 1}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="685800" y="${yPos}"/><a:ext cx="9906000" cy="500000"/></a:xfrm></p:spPr><p:txBody><a:bodyPr wrap="none"/><a:lstStyle/><a:p>${bold}<a:endParaRPr lang="zh-CN"/><a:t>${escapeXml(item.text)}</a:t></a:p></p:txBody></p:sp>`;
      })
      .join("");

    writeFileSync(
      join(tmpDir, `ppt/slides/slide${idx + 1}.xml`),
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld>${bgXml}<p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:nvGrpSpPr/></p:nvGrpSpPr>${titleEl}${bodyEls}</p:spTree></p:cSld></p:sld>`,
      "utf-8",
    );
    writeFileSync(
      join(tmpDir, `ppt/slides/_rels/slide${idx + 1}.xml.rels`),
      `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`,
      "utf-8",
    );
  });

  zipDir(tmpDir, output);
  warnings.push(`PPTX 已生成（${slides.length} 页，基于 section 结构排版）`);
  return { file: output, slides: slides.length, warnings };
}

// ─── 纯文本 fallback ─────────────────────────────────────────────────────────

function extractSimpleText(html: string): string[] {
  const lines: string[] = [];
  const tags = ["h1", "h2", "h3", "h4", "p", "li", "blockquote"];
  for (const tag of tags) {
    const re = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, "gi");
    let m;
    while ((m = re.exec(html)) !== null) {
      lines.push(m[1].trim());
    }
  }
  if (lines.length === 0) lines.push(extractTitle(html) || "BWVI Export");
  return lines;
}
