const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScript } = require('./helpers/load-script');

test('第3世代のバッジ補正は実数値を1.1倍して切り捨てる', () => {
  const script = loadScript();

  assert.equal(script.evaluate('applyBadgeModifier(99, false)'), 99);
  assert.equal(script.evaluate('applyBadgeModifier(99, true)'), 108);
  assert.equal(script.evaluate('applyBadgeModifier(100, true)'), 110);
});

test('攻撃側と防御側に独立したバッジ補正チェックを表示する', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(html, /id="attackerBadgeCheck"/);
  assert.match(html, /id="defenderBadgeCheck"/);
  assert.match(html, /攻撃1\.1倍/);
  assert.match(html, /防御1\.1倍/);
});

test('防御側の持ち物補正は攻撃値ではなく防御値へ掛ける', () => {
  const script = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

  assert.match(script, /finalDefense = Math\.floor\(finalDefense \* modifier\)/);
  assert.doesNotMatch(script, /finalDefense = Math\.floor\(finalAttack \* modifier\)/);
});
