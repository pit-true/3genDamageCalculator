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

test('サイコウェーブはLvの50%から150%まで10%刻みの11通りになる', () => {
  const script = loadScript();

  assert.deepEqual(
    Array.from(script.evaluate('calculatePsywaveDamageValues(50)')),
    [25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75]
  );
  assert.deepEqual(
    Array.from(script.evaluate('calculatePsywaveDamageValues(1)')),
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  );
});

test('プレゼントは40/30/10%の威力結果と20%の1/4回復を持つ', () => {
  const script = loadScript();
  const outcomes = JSON.parse(script.evaluate('JSON.stringify(getPresentOutcomes(203))'));

  assert.deepEqual(outcomes, [
    { kind: 'damage', power: 40, probability: 0.4 },
    { kind: 'damage', power: 80, probability: 0.3 },
    { kind: 'damage', power: 120, probability: 0.1 },
    { kind: 'heal', amount: 50, probability: 0.2 }
  ]);
});

test('サイコウェーブとプレゼントを専用クラスと設定UIへ接続する', () => {
  const moves = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'pokemon_moves.json'), 'utf8'));
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.equal(moves.find(move => move.name === 'サイコウェーブ').class, 'psywave');
  assert.equal(moves.find(move => move.name === 'プレゼント').class, 'present');
  assert.match(html, /id="presentSettings"/);
  assert.match(html, /id="presentOutcome"/);
});

test('トリプルキックは威力10・20・30で、各段ごとに命中判定する', () => {
  const script = loadScript();

  assert.deepEqual(Array.from(script.evaluate('getTripleKickPowers()')), [10, 20, 30]);
  assert.deepEqual(
    Array.from(script.evaluate(
      'getTripleKickHitProbabilities(90).map(value => Math.round(value * 1000) / 1000)'
    )),
    [0.1, 0.09, 0.081, 0.729]
  );
  assert.deepEqual(
    Array.from(script.evaluate(
      'sumDamageRanges([[8, 10], [15, 20], [23, 30]])'
    )),
    [46, 60]
  );
});
