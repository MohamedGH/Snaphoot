import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRouteFromHash, buildRouteHash } from './routes';

test('Route Manager: parseRouteFromHash handles valid routes', () => {
  assert.equal(parseRouteFromHash('#/dashboard').route, 'dashboard');
  assert.equal(parseRouteFromHash('#/snapshots').route, 'snapshots');
  assert.equal(parseRouteFromHash('#/analytics').route, 'analytics');
  assert.equal(parseRouteFromHash('#/stresstest').route, 'stresstest');
  assert.equal(parseRouteFromHash('#/settings').route, 'settings');
});

test('Route Manager: parseRouteFromHash falls back to dashboard for invalid hash', () => {
  assert.equal(parseRouteFromHash('').route, 'dashboard');
  assert.equal(parseRouteFromHash('#/unknown-route').route, 'dashboard');
});

test('Route Manager: parseRouteFromHash extracts query parameters', () => {
  const parsed = parseRouteFromHash('#/snapshots?filter=alerts&sort=desc');
  assert.equal(parsed.route, 'snapshots');
  assert.equal(parsed.params.filter, 'alerts');
  assert.equal(parsed.params.sort, 'desc');
});

test('Route Manager: buildRouteHash formats hash with params', () => {
  const hash1 = buildRouteHash('dashboard');
  assert.equal(hash1, '#/dashboard');

  const hash2 = buildRouteHash('snapshots', { filter: 'alerts', tag: 'cpu' });
  assert.equal(hash2, '#/snapshots?filter=alerts&tag=cpu');
});
