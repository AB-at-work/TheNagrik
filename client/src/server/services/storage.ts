import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { env, isStorageConfigured } from '../config/env';
import { logger } from '../config/logger';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

let s3Client: S3Client | null = null;

if (isStorageConfigured) {
  s3Client = new S3Client({
    region: 'auto',
    endpoint: env.STORAGE_ENDPOINT || `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  });
} else {
  logger.warn('Storage is not configured (missing credentials). Uploads will fall back to local disk.');
}

export const storageService = {
  async uploadFile(buffer: Buffer, originalName: string, contentType: string): Promise<{ url: string, key: string }> {
    const ext = originalName.split('.').pop() || 'bin';
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const key = `uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${uniqueId}.${ext}`;

    if (!s3Client) {
      try {
        const publicDir = path.join(process.cwd(), 'public');
        const uploadDir = path.join(publicDir, 'uploads', `${new Date().getFullYear()}`, `${new Date().getMonth() + 1}`);
        
        // Ensure folder exists
        fs.mkdirSync(uploadDir, { recursive: true });
        
        const filePath = path.join(uploadDir, `${uniqueId}.${ext}`);
        fs.writeFileSync(filePath, buffer);
        
        const localUrl = `/uploads/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${uniqueId}.${ext}`;
        logger.info({ filePath, localUrl }, 'File saved to local filesystem (S3 unconfigured fallback)');
        
        return { url: localUrl, key };
      } catch (err) {
        logger.error({ err }, 'Failed to save file to local filesystem');
        throw new Error('Local file upload failed');
      }
    }

    try {
      const command = new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      });

      await s3Client.send(command);
      return { url: `${env.R2_PUBLIC_URL}/${key}`, key };
    } catch (error) {
      logger.error({ err: error, key }, 'Failed to upload file to S3');
      throw new Error('File upload failed');
    }
  },

  async deleteFile(key: string): Promise<void> {
    if (!s3Client) {
      try {
        const filePath = path.join(process.cwd(), 'public', key);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info({ filePath }, 'File deleted from local filesystem');
        }
      } catch (err) {
        logger.error({ err, key }, 'Failed to delete file from local filesystem');
      }
      return;
    }

    try {
      const command = new DeleteObjectCommand({
        Bucket: env.R2_BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      logger.error({ err: error, key }, 'Failed to delete file from S3');
      throw new Error('File deletion failed');
    }
  }
};
