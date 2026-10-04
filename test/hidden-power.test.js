const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScript } = require('./helpers/load-script');

test('個体値からめざパのタイプと威力を求める', () => {
  const script = loadScript();

  assert.deepEqual(
    { ...script.evaluate('hiddenPowerFromIVs({ hp: 31, a: 31, b: 31, c: 31, d: 31, s: 31 })') },
    { type: 'あく', power: 70 }
  );
  assert.deepEqual(
    { ...script.evaluate('hiddenPowerFromIVs({ hp: 30, a: 30, b: 30, c: 30, d: 30, s: 31 })') },
    { type: 'ひこう', power: 70 }
  );
  assert.deepEqual(
    { ...script.evaluate('hiddenPowerFromIVs({ hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0 })') },
    { type: 'かくとう', power: 30 }
  );
});

test('めざパ選択時に技データ本体を書き換えずタイプを反映したコピーを返す', () => {
  const script = loadScript();

  const result = script.evaluate(`(() => {
    const original = { name: 'めざめるパワー', type: 'ノーマル', category: 'Physical', class: 'awaken_power', power: 70 };
    const resolved = resolveDynamicMove(original, { hp: 31, a: 30, b: 30, c: 31, d: 31, s: 31 });
    return { original: { ...original }, resolved: { ...resolved } };
  })()`);

  assert.equal(result.original.type, 'ノーマル');
  assert.equal(result.resolved.type, 'こおり');
  assert.equal(result.resolved.category, 'Special');
});

