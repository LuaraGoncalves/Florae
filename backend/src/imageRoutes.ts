import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { rateLimit } from "express-rate-limit";
import { requireAdmin } from "./auth.js";
import { imageStorageConfigured, storeImage } from "./services/imageStorage.js";

export function createImageRouter(save = storeImage, configured = imageStorageConfigured) {
  const router = Router();
  router.use(requireAdmin);
  router.get("/status", (_request, response) => response.json({ enabled: configured() }));
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 0 },
    fileFilter: (_request, file, done) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) return done(new Error("INVALID_IMAGE_TYPE"));
      done(null, true);
    } });
  router.post("/", rateLimit({ windowMs: 60000, limit: 15, standardHeaders: true, legacyHeaders: false,
    message: { message: "Muitos envios. Aguarde um minuto." } }), (request, response) => {
    if (!configured()) { response.status(503).json({ message: "O armazenamento de fotos ainda não foi configurado." }); return; }
    upload.single("image")(request, response, async (error: unknown) => {
      if (error) {
        const tooLarge = error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE";
        response.status(tooLarge ? 413 : 400).json({ message: tooLarge ? "A foto deve ter até 5 MB." : "Envie uma única foto JPEG, PNG ou WebP." }); return;
      }
      if (!request.file) { response.status(400).json({ message: "Selecione uma foto." }); return; }
      let buffer: Buffer;
      try {
        const image = sharp(request.file.buffer, { limitInputPixels: 25000000, failOn: "warning" });
        const metadata = await image.metadata();
        if (!["jpeg", "png", "webp"].includes(metadata.format ?? "") || (metadata.pages ?? 1) > 1) throw new Error("Invalid image");
        buffer = await image.rotate().resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer();
      } catch { response.status(400).json({ message: "Foto inválida. Use JPEG, PNG ou WebP de até 25 megapixels, sem animação." }); return; }
      try { response.status(201).json({ imageUrl: await save(buffer) }); }
      catch { response.status(502).json({ message: "Não foi possível armazenar a foto. Tente novamente." }); }
    });
  });
  return router;
}
