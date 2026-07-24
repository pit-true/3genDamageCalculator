const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScript } = require('./helpers/load-script');

test('やどりぎ回復は防御側ではなく攻撃側の最大HPの1/8を参照する', () => {
  const script = loadScript();

  const healAmount = script.evaluate(`
    attackerPokemon = {
      baseStats: { hp: 100, a: 1, b: 1, c: 1, d: 1, s: 1 },
      ivValues: { hp: 31, a: 0, b: 0, c: 0, d: 0, s: 0 },
      evValues: { hp: 0, a: 0, b: 0, c: 0, d: 0, s: 0 },
      natureModifiers: { a: 1, b: 1, c: 1, d: 1, s: 1 },
      level: 50
    };
    calculateLeechSeed2HealAmount(400);
  `);

  // 攻撃側の最大HPは175。400（防御側HP）ではなく175 / 8を切り捨てる。
  assert.equal(healAmount, 21);
});
