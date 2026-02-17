import test from 'node:test';
import assert from 'node:assert/strict';

function checkRateLimit(bucket, key, max, windowMs, now) {
  const current = bucket.get(key);
  if (!current || current.resetAt <= now) {
    bucket.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (current.count >= max) {
    return { allowed: false };
  }

  current.count += 1;
  bucket.set(key, current);
  return { allowed: true };
}

test('allows within limits then blocks', () => {
  const bucket = new Map();
  const key = 'user';
  assert.equal(checkRateLimit(bucket, key, 2, 1000, 0).allowed, true);
  assert.equal(checkRateLimit(bucket, key, 2, 1000, 10).allowed, true);
  assert.equal(checkRateLimit(bucket, key, 2, 1000, 20).allowed, false);
});
