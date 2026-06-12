import sharp from 'sharp';

export const imageProcessor = {
  async process(buffer: Buffer): Promise<{ buffer: Buffer; format: string; width: number; height: number }> {
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Default to webp for optimization
    const format = 'webp';
    const processedBuffer = await image
      .resize({
        width: 1920,
        height: 1080,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer();

    const newMetadata = await sharp(processedBuffer).metadata();

    return {
      buffer: processedBuffer,
      format,
      width: newMetadata.width || metadata.width || 0,
      height: newMetadata.height || metadata.height || 0,
    };
  }
};
