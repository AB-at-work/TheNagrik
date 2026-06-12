import { db } from '../../../db/index';
import { settings, type Setting } from '../../../db/schema';
import { eq } from 'drizzle-orm';
import { logAction, computeDiff } from '../../services/auditLog';
import { AppError } from '../../utils/errors';

export const settingsService = {
  async getPublicSettings(): Promise<Record<string, string>> {
    const allSettings = await db.query.settings.findMany();
    const map: Record<string, string> = {};
    for (const s of allSettings) {
      map[s.key] = s.value;
    }
    return map;
  },

  async getAllSettingsAdmin(): Promise<Setting[]> {
    return db.query.settings.findMany({
      orderBy: (s, { asc }) => [asc(s.group), asc(s.key)],
    });
  },

  async updateSetting(key: string, value: string, userId: string, userEmail: string): Promise<Setting> {
    const existing = await db.query.settings.findFirst({
      where: eq(settings.key, key),
    });

    if (!existing) {
      throw AppError.notFound(`Setting with key ${key} not found`);
    }

    const diff = computeDiff(existing, { value }, ['value']);

    const [updated] = await db.update(settings)
      .set({ value, updatedBy: userId, updatedAt: new Date() })
      .where(eq(settings.key, key))
      .returning();

    if (!updated) {
      throw AppError.internal('Failed to update setting');
    }

    // Fire and forget audit log
    if (Object.keys(diff).length > 0) {
      logAction({
        userId,
        userEmail,
        action: 'update',
        entityType: 'setting',
        entityId: updated.id,
        entityTitle: updated.key,
        changes: diff,
      }).catch(console.error);
    }

    return updated;
  }
};
