import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { sendSuccess, sendError } from "../utils/response.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, "../../uploads");

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Format human-readable file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Sanitize and preserve clean, URL-safe filename without raw spaces
    const ext = path.extname(file.originalname);
    const rawBase = path.basename(file.originalname, ext);
    let cleanBase = rawBase.replace(/[^a-zA-Z0-9_\-]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
    if (!cleanBase) {
      cleanBase = "slide_deck";
    }
    const uniqueSuffix = `${Date.now()}`;
    cb(null, `${cleanBase}-${uniqueSuffix}${ext}`);
  },
});

// Allow PPT, PPTX, PDF, Images, and Documents up to 100MB
const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for rich slide decks
  },
});

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Upload document, slide deck (PPTX/PDF), or image file
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 */
router.post(
  "/",
  authenticateToken,
  upload.single("file"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return sendError(res, "No file provided in form-data ('file' key expected)", 400);
      }

      const file = req.file;
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const relativeUrl = `/uploads/${file.filename}`;
      const fileUrl = `${baseUrl}${relativeUrl}`;
      const formattedSize = formatFileSize(file.size);

      // Detect general category
      const ext = path.extname(file.originalname).toLowerCase();
      let category = "Document";
      if ([".ppt", ".pptx", ".key", ".odp"].includes(ext)) {
        category = "Slides";
      } else if (ext === ".pdf") {
        category = "PDF";
      } else if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"].includes(ext)) {
        category = "Image";
      }

      const fileData = {
        fileName: file.filename,
        originalName: file.originalname,
        fileUrl,
        relativeUrl,
        fileType: file.mimetype,
        category,
        fileSize: formattedSize,
        sizeBytes: file.size,
      };

      sendSuccess(res, fileData, "File uploaded successfully to backend /uploads directory", 201);
    } catch (err: any) {
      sendError(res, `Failed to upload file: ${err.message}`, 500);
    }
  }
);

/**
 * @swagger
 * /api/upload/multiple:
 *   post:
 *     summary: Upload multiple attachments
 *     tags: [Uploads]
 */
router.post(
  "/multiple",
  authenticateToken,
  upload.array("files", 10),
  (req: Request, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return sendError(res, "No files uploaded", 400);
      }

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const results = files.map((file) => ({
        fileName: file.filename,
        originalName: file.originalname,
        fileUrl: `${baseUrl}/uploads/${file.filename}`,
        relativeUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
        fileSize: formatFileSize(file.size),
        sizeBytes: file.size,
      }));

      sendSuccess(res, results, `${results.length} files uploaded successfully to /uploads`, 201);
    } catch (err: any) {
      sendError(res, `Upload failed: ${err.message}`, 500);
    }
  }
);

export default router;
