/**
 * Validates input against a Zod schema, returning the parsed (coerced/defaulted)
 * value. Ports server/src/middleware/validate.ts — a ZodError is converted into
 * AppError.validation so the error mapper produces the same 422 envelope.
 */
import { ZodError, type ZodTypeAny, type infer as ZodInfer } from 'zod';

import { AppError } from '@/server/utils/errors';

export function parse<S extends ZodTypeAny>(schema: S, data: unknown): ZodInfer<S> {
  try {
    return schema.parse(data) as ZodInfer<S>;
  } catch (err) {
    if (err instanceof ZodError) {
      throw AppError.validation(
        'Validation failed',
        err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      );
    }
    throw err;
  }
}

/** Parses URLSearchParams into a plain object for schema validation. */
export function searchParamsToObject(params: URLSearchParams): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of params.entries()) out[k] = v;
  return out;
}
