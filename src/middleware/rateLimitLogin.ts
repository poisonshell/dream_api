import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types/context';

type Bucket = { count: number; resetAt: number };
const WINDOW_MS = parseInt(process.env.LOGIN_RATE_WINDOW_MS || '60000', 10); // 1 minute
const MAX_ATTEMPTS = parseInt(process.env.LOGIN_RATE_MAX || '5', 10); // 5 per window
const buckets = new Map<string, Bucket>();

function keyFromContext(ctx: MyContext) {
  const ip =
    (ctx.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    ctx.req.ip ||
    'unknown';
  return ip;
}

export const rateLimitLogin: MiddlewareFn<MyContext> = async ({ context, info }, next) => {
  if (info.fieldName !== 'loginAdmin') {
    return next();
  }

  const key = keyFromContext(context);
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, resetAt: now + WINDOW_MS };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + WINDOW_MS;
  }

  bucket.count += 1;
  buckets.set(key, bucket);

  if (bucket.count > MAX_ATTEMPTS) {
    const wait = Math.max(0, bucket.resetAt - now);
    throw new Error(`Too many login attempts. Try again in ${Math.ceil(wait / 1000)} seconds.`);
  }

  return next();
};
