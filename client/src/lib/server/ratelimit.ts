/**
 * Rate limiting seam.
 *
 * Implements a simple in-memory sliding window rate limiter.
 * For multi-node distributed deployments, replace `rateLimitMap` with @upstash/ratelimit
 * (Upstash Redis) keyed by IP/user.
 */
import type { NextRequest } from 'next/server';

export type RateLimitName = 'auth' | 'forms' | 'general' | 'adminApi' | 'mediaUpload';

const rateLimitMap = new Map<string, { count: number; expiresAt: number }>();

// Configurations per bucket
const LIMITS: Record<RateLimitName, { max: number; windowMs: number }> = {
  auth: { max: 5, windowMs: 60000 },       // 5 per minute
  forms: { max: 10, windowMs: 60000 },     // 10 per minute
  general: { max: 100, windowMs: 60000 },  // 100 per minute
  adminApi: { max: 200, windowMs: 60000 }, // 200 per minute
  mediaUpload: { max: 10, windowMs: 60000 },// 10 per minute
};

export async function checkRateLimit(
  req: NextRequest,
  name: RateLimitName,
): Promise<{ allowed: boolean }> {
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const key = `${name}:${ip}`;
  
  const now = Date.now();
  const config = LIMITS[name];
  
  let record = rateLimitMap.get(key);
  
  if (!record || record.expiresAt < now) {
    record = { count: 1, expiresAt: now + config.windowMs };
    rateLimitMap.set(key, record);
    return { allowed: true };
  }
  
  if (record.count >= config.max) {
    return { allowed: false };
  }
  
  record.count++;
  rateLimitMap.set(key, record);
  return { allowed: true };
}
