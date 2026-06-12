import { db } from '../../../db/index';
import { mediaFiles, type MediaFile } from '../../../db/schema';
import { eq, desc } from 'drizzle-orm';
import { storageService } from '../../services/storage';
import { imageProcessor } from '../../services/imageProcessor';
import { logAction } from '../../services/auditLog';
import { parsePagination, buildPaginationMeta } from '../../utils/pagination';

export const mediaService = {
  async upload(
    file: {
      buffer: Buffer;
      originalname: string;
      mimetype: string;
      size: number;
    },
    altText: string | null,
    userId: string,
    userEmail: string
  ): Promise<MediaFile> {
    let finalBuffer = file.buffer;
    let width = null;
    let height = null;
    let mimeType = file.mimetype;
    const isImage = file.mimetype.startsWith('image/');

    if (isImage) {
      const processed = await imageProcessor.process(file.buffer);
      finalBuffer = processed.buffer;
      width = processed.width;
      height = processed.height;
      mimeType = `image/${processed.format}`;
    }

    const { url, key } = await storageService.uploadFile(finalBuffer, file.originalname, mimeType);

    const [newMedia] = await db.insert(mediaFiles)
      .values({
        url,
        storageKey: key,
        filename: file.originalname,
        altText,
        mimeType,
        fileSize: finalBuffer.length,
        width,
        height,
        uploadedBy: userId,
      })
      .returning();

    if (!newMedia) {
      throw new Error('Failed to insert media');
    }

    // Fire and forget audit
    logAction({
      userId,
      userEmail,
      action: 'create',
      entityType: 'media',
      entityId: newMedia.id,
      entityTitle: newMedia.url,
      changes: null,
    }).catch(console.error);

    return newMedia;
  },

  async list(page: number = 1, limit: number = 20) {
    const { limit: l, offset } = parsePagination(page, limit);

    const data = await db.query.mediaFiles.findMany({
      orderBy: [desc(mediaFiles.createdAt)],
      limit: l,
      offset,
    });

    const totalRecords = await db.$count(mediaFiles);

    return {
      data,
      meta: buildPaginationMeta(totalRecords, { page, limit: l, perPage: limit, offset }),
    };
  },

  async delete(id: string, userId: string, userEmail: string): Promise<void> {
    const existing = await db.query.mediaFiles.findFirst({
      where: eq(mediaFiles.id, id),
    });

    if (!existing) {
      return;
    }

    await storageService.deleteFile(existing.storageKey);

    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));

    // Fire and forget audit
    logAction({
      userId,
      userEmail,
      action: 'delete',
      entityType: 'media',
      entityId: id,
      entityTitle: existing.url,
      changes: null,
    }).catch(console.error);
  }
};
