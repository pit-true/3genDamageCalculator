const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

// 実機(pm_eme_ose)ではいわなだれはattackrange=RANGE_DOUBLE(相手2体に攻撃)。
// ダブルバトルで相手2体がいる場合、本ツールはtarget===2のときのみダメージを半減する。
test('いわなだれはダブル半減の対象となるtarget: 2を持つ', () => {
  const moves = JSON.parse(
    fs.readFileSync(path.join(__dirname, '..', 'pokemon_moves.json'), 'utf8')
  );

  assert.equal(moves.find(move => move.name === 'いわなだれ')?.target, 2);
});
