const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScript } = require('./helpers/load-script');

test('アイスボールは5ターンまで倍化し、まるくなるでさらに2倍になる', () => {
  const script = loadScript();

  assert.deepEqual(
    Array.from(script.evaluate('[1, 2, 3, 4, 5].map(turn => calculateIceBallPower(turn, false))')),
    [30, 60, 120, 240, 480]
  );
  assert.deepEqual(
    Array.from(script.evaluate('[1, 2, 3, 4, 5].map(turn => calculateIceBallPower(turn, true))')),
    [60, 120, 240, 480, 960]
  );
});

test('れんぞくぎりは連続成功5回まで倍化する', () => {
  const script = loadScript();

  assert.deepEqual(
    Array.from(script.evaluate('[1, 2, 3, 4, 5].map(count => calculateFuryCutterPower(count))')),
    [10, 20, 40, 80, 160]
  );
});

test('いかりの被弾回数を攻撃ランクへ加算し、+6で止める', () => {
  const script = loadScript();

  assert.equal(script.evaluate("calculateRageAttackRank('±0', 3)"), '+3');
  assert.equal(script.evaluate("calculateRageAttackRank('+4', 3)"), '+6');
  assert.equal(script.evaluate("calculateRageAttackRank('-2', 1)"), '-1');
});

test('はきだすは通常計算後のダメージをたくわえた回数倍する', () => {
  const script = loadScript();

  assert.equal(script.evaluate('calculateSpitUpDamage(37, 1)'), 37);
  assert.equal(script.evaluate('calculateSpitUpDamage(37, 2)'), 74);
  assert.equal(script.evaluate('calculateSpitUpDamage(37, 3)'), 111);
});

test('4技を専用クラスと設定UIへ接続する', () => {
  const moves = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'pokemon_moves.json'), 'utf8')
  );
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const expectedClasses = {
    'アイスボール': 'ice_ball',
    'いかり': 'rage',
    'はきだす': 'spit_up',
    'れんぞくぎり': 'fury_cutter'
  };

  for (const [name, moveClass] of Object.entries(expectedClasses)) {
    assert.equal(moves.find(move => move.name === name)?.class, moveClass);
  }
  for (const id of ['iceBallSettings', 'rageSettings', 'spitUpSettings', 'furyCutterSettings']) {
    assert.match(html, new RegExp(`id="${id}"`));
  }
});
