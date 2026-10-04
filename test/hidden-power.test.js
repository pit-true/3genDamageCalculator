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

test('めざパのタイプ指定プリセットはすべて指定タイプの威力70になる', () => {
  const script = loadScript();
  const presets = script.evaluate('HIDDEN_POWER_PRESETS');

  assert.equal(presets.length, 17);
  for (const preset of presets) {
    const result = script.evaluate(`hiddenPowerFromIVs(${JSON.stringify(preset.ivs)})`);
    assert.equal(result.type, preset.type, preset.label);
    assert.equal(result.power, 70, preset.label);
  }
});

test('めざ飛はS31とA31の2通りを選べる', () => {
  const script = loadScript();
  const flying = JSON.parse(script.evaluate(
    "JSON.stringify(HIDDEN_POWER_PRESETS.filter(p => p.type === 'ひこう').map(p => p.ivs))"
  ));

  assert.deepEqual(flying, [
    { hp: 30, a: 30, b: 30, c: 30, d: 30, s: 31 },
    { hp: 31, a: 31, b: 31, c: 30, d: 30, s: 30 }
  ]);
});

test('個体値が一致するプリセットを特定する', () => {
  const script = loadScript();

  assert.equal(
    script.evaluate("findHiddenPowerPreset({ hp: 31, a: 31, b: 31, c: 30, d: 30, s: 30 })?.label"),
    'ひこう (A31)'
  );
  assert.equal(
    script.evaluate("findHiddenPowerPreset({ hp: 31, a: 31, b: 31, c: 31, d: 31, s: 30 })"),
    null
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

test('タイプ指定リストはゲーム内のタイプ順に並ぶ', () => {
  const script = loadScript();

  assert.deepEqual(
    JSON.parse(script.evaluate('JSON.stringify(HIDDEN_POWER_PRESETS.map(p => p.label))')),
    [
      'ほのお', 'みず', 'でんき', 'くさ', 'こおり', 'かくとう', 'どく', 'じめん',
      'ひこう (S31)', 'ひこう (A31)', 'エスパー', 'むし', 'いわ', 'ゴースト', 'ドラゴン', 'あく', 'はがね'
    ]
  );
});
