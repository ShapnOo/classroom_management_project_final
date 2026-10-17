import JSZip from "jszip";

export interface ParsedSlide {
  id: number;
  slideNum: number;
  title: string;
  subtitle?: string;
  bullets?: string[];
  imageUrl?: string;
  type: "image" | "bullets" | "cover";
  notes?: string;
}

export interface PptxParseResult {
  totalSlides: number;
  slides: ParsedSlide[];
  title: string;
}

/**
 * Universal PPTX Parser: Extracts slides, titles, bullet points, and embedded images
 * directly from any PowerPoint (.pptx) file in the browser.
 */
export async function parsePptx(fileOrBuffer: File | Blob | ArrayBuffer | string): Promise<PptxParseResult> {
  let arrayBuffer: ArrayBuffer;

  if (typeof fileOrBuffer === "string") {
    const res = await fetch(fileOrBuffer);
    if (!res.ok) throw new Error(`Failed to fetch PPTX from ${fileOrBuffer}`);
    arrayBuffer = await res.arrayBuffer();
  } else if (fileOrBuffer instanceof Blob) {
    arrayBuffer = await fileOrBuffer.arrayBuffer();
  } else {
    arrayBuffer = fileOrBuffer;
  }

  const zip = await JSZip.loadAsync(arrayBuffer);

  // Find all slide XML files
  const slideKeys = Object.keys(zip.files).filter((k) =>
    k.match(/^ppt\/slides\/slide[0-9]+\.xml$/)
  );

  // Sort slides numerically: slide1.xml, slide2.xml, ..., slide20.xml
  slideKeys.sort((a, b) => {
    const numA = parseInt(a.replace(/[^0-9]/g, ""), 10);
    const numB = parseInt(b.replace(/[^0-9]/g, ""), 10);
    return numA - numB;
  });

  const parsedSlides: ParsedSlide[] = [];

  for (let i = 0; i < slideKeys.length; i++) {
    const slidePath = slideKeys[i];
    const slideNum = i + 1;
    const slideXml = await zip.files[slidePath].async("text");

    // 1. Check relationships for associated images in ppt/slides/_rels/slide{N}.xml.rels
    const relPath = `ppt/slides/_rels/slide${slideNum}.xml.rels`;
    let imageTarget: string | null = null;
    let imageUrl: string | undefined = undefined;

    if (zip.files[relPath]) {
      const relXml = await zip.files[relPath].async("text");
      // Find image target
      const imgMatch = relXml.match(/Target="\.\.\/media\/([^"]+)"/);
      if (imgMatch) {
        imageTarget = `ppt/media/${imgMatch[1]}`;
      }
    }

    if (imageTarget && zip.files[imageTarget]) {
      try {
        const ext = imageTarget.split(".").pop()?.toLowerCase() || "png";
        const mimeType =
          ext === "jpg" || ext === "jpeg"
            ? "image/jpeg"
            : ext === "svg"
            ? "image/svg+xml"
            : ext === "webp"
            ? "image/webp"
            : "image/png";
        const base64 = await zip.files[imageTarget].async("base64");
        imageUrl = `data:${mimeType};base64,${base64}`;
      } catch (err) {
        console.warn(`Could not extract image for slide ${slideNum}:`, err);
      }
    }

    // 2. Extract text paragraphs and runs from slide XML
    const paragraphs: string[] = [];
    const pMatches = slideXml.matchAll(/<a:p\b[^>]*>(.*?)<\/a:p>/g);
    for (const p of pMatches) {
      const textMatches = Array.from(p[1].matchAll(/<a:t>([^<]+)<\/a:t>/g))
        .map((m) => m[1].trim())
        .filter(Boolean);
      if (textMatches.length > 0) {
        paragraphs.push(textMatches.join(" "));
      }
    }

    // Filter duplicates and clean text
    const cleanParagraphs = Array.from(new Set(paragraphs));
    const title = cleanParagraphs[0] || `Slide ${slideNum}`;
    const subtitle = cleanParagraphs[1] || "";
    const bullets = cleanParagraphs.slice(2);

    parsedSlides.push({
      id: slideNum,
      slideNum,
      title,
      subtitle,
      bullets,
      imageUrl,
      type: imageUrl ? "image" : slideNum === 1 ? "cover" : "bullets",
      notes: `Slide ${slideNum} extracted from PowerPoint presentation.`,
    });
  }

  return {
    totalSlides: parsedSlides.length,
    slides: parsedSlides,
    title: parsedSlides[0]?.title || "Presentation Deck",
  };
}
