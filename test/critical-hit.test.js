const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScript } = require('./helpers/load-script');

// 実機(pm_eme_ose WazaDamageCalc)の急所仕様:
// ・攻撃側の下降ランクは急所時に無視される(上昇ランクはそのまま適用)
// ・防御側の上昇ランクは急所時に無視される(下降ランクはそのまま適用)
test('急所時は攻撃側の下降ランクを無視し、上昇ランクはそのまま適用する', () => {
  const script = loadScript();

  assert.equal(script.evaluate("getCriticalAdjustedRankMultiplier('-2', true, true)"), 1.0);
  assert.equal(script.evaluate("getCriticalAdjustedRankMultiplier('-2', false, true)"), 10 / 20);
  assert.equal(script.evaluate("getCriticalAdjustedRankMultiplier('+2', true, true)"), 20 / 10);
});

test('急所時は防御側の上昇ランクを無視し、下降ランクはそのまま適用する', () => {
  const script = loadScript();

  assert.equal(script.evaluate("getCriticalAdjustedRankMultiplier('+2', true, false)"), 1.0);
  assert.equal(script.evaluate("getCriticalAdjustedRankMultiplier('+2', false, false)"), 20 / 10);
  assert.equal(script.evaluate("getCriticalAdjustedRankMultiplier('-2', true, false)"), 10 / 20);
});

test('急所でない場合は通常通りランク補正を適用する', () => {
  const script = loadScript();

  assert.equal(script.evaluate("getCriticalAdjustedRankMultiplier('-2', false, true)"), script.evaluate("getRankMultiplier('-2')"));
  assert.equal(script.evaluate("getCriticalAdjustedRankMultiplier('+2', false, false)"), script.evaluate("getRankMultiplier('+2')"));
});

test('急所はひかりのかべ・リフレクターを貫通する', () => {
  const script = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

  assert.match(
    script,
    /const hasWall = document\.getElementById\('wallCheck'\)\.checked && !isCritical;/
  );
});
