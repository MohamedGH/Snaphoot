import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ok,
  err,
  isOk,
  isErr,
  map,
  flatMap,
  getOrElse,
  matchResult,
  tryCatch,
  tryCatchAsync,
} from './result';

test('Result: ok and err creation', () => {
  const good = ok(42);
  const bad = err(new Error('fail'));

  assert.equal(isOk(good), true);
  assert.equal(isErr(good), false);
  assert.equal(good.value, 42);

  assert.equal(isOk(bad), false);
  assert.equal(isErr(bad), true);
  assert.equal(bad.error.message, 'fail');
});

test('Result: map operation', () => {
  const good = ok(10);
  const mapped = map(good, (x: number) => x * 2);
  assert.equal(isOk(mapped), true);
  assert.equal(isOk(mapped) ? mapped.value : 0, 20);

  const bad = err(new Error('no map'));
  const mappedBad = map(bad, (x: number) => x * 2);
  assert.equal(isErr(mappedBad), true);
});

test('Result: flatMap operation', () => {
  const good = ok(10);
  const flat = flatMap(good, (x: number) => ok(x + 5));
  assert.equal(isOk(flat), true);
  assert.equal(isOk(flat) ? flat.value : 0, 15);

  const flatToErr = flatMap(good, () => err(new Error('chain error')));
  assert.equal(isErr(flatToErr), true);
});

test('Result: getOrElse and matchResult', () => {
  const good = ok('valid');
  const bad = err(new Error('invalid'));

  assert.equal(getOrElse(good, 'fallback'), 'valid');
  assert.equal(getOrElse(bad, 'fallback'), 'fallback');

  const matchedGood = matchResult(good, {
    onOk: (v: string) => `Success: ${v}`,
    onErr: (e: Error) => `Error: ${e.message}`,
  });
  assert.equal(matchedGood, 'Success: valid');

  const matchedBad = matchResult(bad, {
    onOk: (v: string) => `Success: ${v}`,
    onErr: (e: Error) => `Error: ${e.message}`,
  });
  assert.equal(matchedBad, 'Error: invalid');
});

test('Result: tryCatch and tryCatchAsync', async () => {
  const safeFn = tryCatch(() => JSON.parse('{"a":1}'));
  assert.equal(isOk(safeFn), true);
  assert.deepEqual(isOk(safeFn) ? safeFn.value : null, { a: 1 });

  const failingFn = tryCatch(() => JSON.parse('{invalid}'));
  assert.equal(isErr(failingFn), true);

  const asyncSuccess = await tryCatchAsync(async () => 123);
  assert.equal(isOk(asyncSuccess), true);

  const asyncFail = await tryCatchAsync(async () => {
    throw new Error('async error');
  });
  assert.equal(isErr(asyncFail), true);
});
