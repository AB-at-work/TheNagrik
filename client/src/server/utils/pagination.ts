import type { PaginationMeta } from '@thenagrik/shared';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '../config/constants';

export interface Pagination {
  page: number;
  perPage: number;
  limit: number;
  offset: number;
}

/** Normalizes raw page/per_page query values into safe pagination bounds. */
export function parsePagination(rawPage?: unknown, rawPerPage?: unknown): Pagination {
  const page = Math.max(1, toInt(rawPage, 1));
  const perPage = Math.min(MAX_PAGE_SIZE, Math.max(1, toInt(rawPerPage, DEFAULT_PAGE_SIZE)));
  return { page, perPage, limit: perPage, offset: (page - 1) * perPage };
}

export function buildPaginationMeta(total: number, p: Pagination): PaginationMeta {
  return {
    total,
    page: p.page,
    per_page: p.perPage,
    last_page: Math.max(1, Math.ceil(total / p.perPage)),
  };
}

function toInt(value: unknown, fallback: number): number {
  const n = typeof value === 'string' ? parseInt(value, 10) : Number(value);
  return Number.isFinite(n) ? n : fallback;
}
