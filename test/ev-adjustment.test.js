const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScript } = require('./helpers/load-script');

test('努力値補正では画面に表示中の個体値を内部キャッシュより優先する', () => {
  const script = loadScript();

  assert.equal(script.evaluate('resolveIVForEVAdjustment(30, 31, 31)'), 30);
  assert.equal(script.evaluate("resolveIVForEVAdjustment('', 30, 31)"), 30);
  assert.equal(script.evaluate("resolveIVForEVAdjustment('', '', 31)"), 31);
});

test('個体値30は8n、個体値31は8n-4へ努力値を補正する', () => {
  const script = loadScript();

  assert.equal(script.evaluate('getAdjustedEVValue(30, 0, 4, 1)'), 8);
  assert.equal(script.evaluate('getAdjustedEVValue(30, 8, 12, 1)'), 16);
  assert.equal(script.evaluate('getAdjustedEVValue(30, 16, 12, -1)'), 8);

  assert.equal(script.evaluate('getAdjustedEVValue(31, 0, 4, 1)'), 4);
  assert.equal(script.evaluate('getAdjustedEVValue(31, 4, 8, 1)'), 12);
  assert.equal(script.evaluate('getAdjustedEVValue(31, 12, 8, -1)'), 4);
});
