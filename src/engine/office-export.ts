import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";

type Format = "pptx" | "docx";

export async function exportOffice(htmlPath: string, format: Format, outputPath: string): Promise<{ file: string; slides?: number; warnings: string[] }> {
  const warnings: string[] = [];
  const html = readFileSync(htmlPath, "utf-8");
  const title = extractTitle(html) || "BWVI Export";

  if (format === "docx") {
    return exportDocx(html, title, outputPath, warnings);
  }
  return exportPptx(html, title, outputPath, htmlPath, warnings);
}

function extractTitle(html: string): string {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  return m ? m[1].trim() : "Untitled";
}

function extractText(html: string): string[] {
  const lines: string[] = [];
  const tags = ["h1","h2","h3","h4","p","li","blockquote"];
  for (const tag of tags) {
    const re = new RegExp(`<${tag}[^>]*>([^<]+)<\/${tag}>`, "gi");
    let m;
    while ((m = re.exec(html)) !== null) {
      lines.push(m[1].trim());
    }
  }
  return lines.length > 0 ? lines : ["Content from " + extractTitle(html)];
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeDocx(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// === DOCX Generator ===
async function exportDocx(html: string, title: string, output: string, warnings: string[]): Promise<{ file: string; warnings: string[] }> {
  const text = extractText(html);
  const paragraphs = text.map((t, i) =>
    `<w:p><w:pPr><w:pStyle w:val="${i === 0 ? 'Title' : 'Normal'}"/></w:pPr><w:r><w:t>${escapeDocx(t)}</w:t></w:r></w:p>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${paragraphs}</w:body></w:document>`;

  const typesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const tmpDir = join(tmpdir(), `bwvi-docx-${Date.now()}`);
  mkdirSync(tmpDir, { recursive: true });
  mkdirSync(join(tmpDir, "word"), { recursive: true });
  mkdirSync(join(tmpDir, "_rels"), { recursive: true });
  mkdirSync(join(tmpDir, "word/_rels"), { recursive: true });

  writeFileSync(join(tmpDir, "[Content_Types].xml"), typesXml, "utf-8");
  writeFileSync(join(tmpDir, "_rels/.rels"), relsXml, "utf-8");
  writeFileSync(join(tmpDir, "word/_rels/document.xml.rels"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`, "utf-8");
  writeFileSync(join(tmpDir, "word/styles.xml"), `<?xml version="1.0"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:sz w:val="24"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="40"/></w:rPr></w:style></w:styles>`, "utf-8");
  writeFileSync(join(tmpDir, "word/document.xml"), xml, "utf-8");

  zipDir(tmpDir, output);
  warnings.push("DOCX generated from HTML text extraction. Open in Word for full formatting.");
  return { file: output, warnings };
}

// === PPTX Generator ===
async function exportPptx(html: string, title: string, output: string, htmlPath: string, warnings: string[]): Promise<{ file: string; slides?: number; warnings: string[] }> {
  const text = extractText(html);
  const chunkSize = Math.max(3, Math.ceil(text.length / 5));
  const slides: string[][] = [];
  for (let i = 0; i < text.length; i += chunkSize) slides.push(text.slice(i, i + chunkSize));
  if (slides.length === 0) slides.push([title]);

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
  let types = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>`;
  slides.forEach((_, i) => { types += `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`; });
  types += `</Types>`;
  writeFileSync(join(tmpDir, "[Content_Types].xml"), types, "utf-8");

  // _rels/.rels
  writeFileSync(join(tmpDir, "_rels/.rels"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`, "utf-8");

  // presentation.xml
  let slideRefs = slides.map((_, i) => `<p:sldId id="${i + 256}" r:id="rId${i + 2}"/>`).join("");
  writeFileSync(join(tmpDir, "ppt/presentation.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>${slideRefs}</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/><p:notesSz cx="6858000" cy="9144000"/></p:presentation>`, "utf-8");

  // ppt/_rels/presentation.xml.rels
  let presRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>`;
  slides.forEach((_, i) => { presRels += `<Relationship Id="rId${i + 2}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`; });
  presRels += `</Relationships>`;
  writeFileSync(join(tmpDir, "ppt/_rels/presentation.xml.rels"), presRels, "utf-8");

  // slideMaster
  writeFileSync(join(tmpDir, "ppt/slideMasters/slideMaster1.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:nvPr/><p:cNvPr id="1" name=""/><p:nvGrpSpPr/></p:nvGrpSpPr></p:spTree></p:cSld></p:sldMaster>`, "utf-8");
  writeFileSync(join(tmpDir, "ppt/slideLayouts/slideLayout1.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:nvGrpSpPr/></p:nvGrpSpPr></p:spTree></p:cSld></p:sldLayout>`, "utf-8");
  writeFileSync(join(tmpDir, "ppt/theme/theme1.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="BWVI"><a:themeElements><a:clrScheme name="BWVI"><a:dk1><a:srgbClr val="000000"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:accent1><a:srgbClr val="D97757"/></a:accent1></a:clrScheme><a:fontScheme name="BWVI"><a:majorFont><a:latin typeface="Inter"/></a:majorFont><a:minorFont><a:latin typeface="Inter"/></a:minorFont></a:fontScheme><a:fmtScheme name="BWVI"/></a:themeElements></a:theme>`, "utf-8");
  writeFileSync(join(tmpDir, "docProps/app.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"><Slides>${slides.length}</Slides></Properties>`, "utf-8");
  writeFileSync(join(tmpDir, "docProps/core.xml"), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties"><dc:title>${escapeXml(title)}</dc:title></cp:coreProperties>`, "utf-8");

  // Slides
  slides.forEach((items, idx) => {
    const elements = items.map((t, i) => {
      const yPos = 700000 + i * 700000;
      const fontSize = i === 0 ? 3600 : 2400;
      const bold = i === 0 ? `<a:rPr sz="${fontSize}" b="1"/>` : `<a:rPr sz="${fontSize}"/>`;
      return `<p:sp><p:nvSpPr><p:cNvPr id="${i + 1}" name="Text${i + 1}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr><p:spPr><a:xfrm><a:off x="457200" y="${yPos}"/><a:ext cx="8229600" cy="600000"/></a:xfrm></p:spPr><p:txBody><a:bodyPr/><a:lstStyle/><a:p>${bold}<a:endParaRPr lang="zh-CN"/><a:t>${escapeXml(t)}</a:t></a:p></p:txBody></p:sp>`;
    }).join("");
    writeFileSync(join(tmpDir, `ppt/slides/slide${idx + 1}.xml`), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:nvGrpSpPr/></p:nvGrpSpPr>${elements}</p:spTree></p:cSld></p:sld>`, "utf-8");
    writeFileSync(join(tmpDir, `ppt/slides/_rels/slide${idx + 1}.xml.rels`), `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"/>`, "utf-8");
  });

  zipDir(tmpDir, output);
  warnings.push(`PPTX generated with ${slides.length} slides from HTML text extraction.`);
  return { file: output, slides: slides.length, warnings };
}

function zipDir(dir: string, output: string): void {
  const cmd = `powershell -NoProfile -Command "& { Compress-Archive -Path '${dir.replace(/'/g, "''")}\\*' -DestinationPath '${output.replace(/'/g, "''")}' -Force }"`;
  try { execSync(cmd, { stdio: "pipe", timeout: 30000, shell: "powershell" }); }
  catch { try { execSync(`7z a "${output}" "${dir}\\*"`, { stdio: "pipe", timeout: 15000, shell: "cmd" }); }
  catch { throw new Error("需要 ZIP 工具。安装 PowerShell 5+ 或 7-Zip"); } }
}
