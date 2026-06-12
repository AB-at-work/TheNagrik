/**
 * Multipart upload handling for route handlers (replaces multer).
 *
 * Reads a single file field from `request.formData()`, enforces the mime
 * allow-list and 10MB size cap that multer's fileFilter/limits enforced, and
 * returns an object shaped like the `Express.Multer.File` the media service
 * still expects ({ buffer, originalname, mimetype, size }).
 */
import { AppError } from '@/server/utils/errors';
import { MAX_UPLOAD_BYTES, ALLOWED_UPLOAD_MIME_TYPES } from '@/server/config/constants';

/** Minimal shape the media service consumes from an uploaded file. */
export interface UploadedFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface MultipartResult {
  file: UploadedFile;
  fields: Record<string, string>;
}

/**
 * Extracts the named file field plus any text fields from a multipart request.
 * Throws AppError (415/413/400) mirroring the old multer rejections.
 */
export async function readUpload(request: Request, fileField = 'file'): Promise<MultipartResult> {
  const form = await request.formData();
  const entry = form.get(fileField);

  if (!entry || typeof entry === 'string') {
    throw AppError.badRequest('No file provided');
  }
  const file = entry as File;

  if (!(ALLOWED_UPLOAD_MIME_TYPES as readonly string[]).includes(file.type)) {
    throw AppError.unsupportedMediaType(
      'Invalid file type. Only JPEG, PNG, WEBP, GIF, and PDF are allowed.',
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw AppError.payloadTooLarge('File exceeds the 10MB upload limit.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const fields: Record<string, string> = {};
  for (const [k, v] of form.entries()) {
    if (k !== fileField && typeof v === 'string') fields[k] = v;
  }

  return {
    file: { buffer, originalname: file.name, mimetype: file.type, size: buffer.length },
    fields,
  };
}
