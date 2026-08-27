const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

// 実機(pm_eme_ose WazaDamageCalc)の仕様:
// タイプ強化アイテム(SoubiItemWazaTypePowUpTbl)はwazatype(技タイプ)が
// 一致したときのみ威力補正(atca)が乗る。一致しない技には補正が乗らない。
test('タイプ不一致のタイプ強化アイテムは攻撃側の補正に加算されない', () => {
  const script = fs.readFileSync(path.join(__dirname, '..', 'script.js'), 'utf8');

  assert.match(
    script,
    /if \(isItemValid && item\.type && item\.type !== moveType\) \{\s*isItemValid = false;\s*\}/
  );
});

test('タイプ指定アイテムはtypeフィールドを持ち、汎用アイテムは持たない', () => {
  const items = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'item.json'), 'utf8'));
  const typeBoostItems = ['シルクのスカーフ', 'もくたん', 'じしゃく', 'くろおび', 'かたいいわ'];
  const genericItems = ['こだわりハチマキ', 'でんきだま', 'ふといホネ', 'こころのしずく'];

  for (const name of typeBoostItems) {
    assert.ok(items.find(item => item.name === name)?.type, `${name} にはtypeが必要`);
  }
  for (const name of genericItems) {
    assert.equal(items.find(item => item.name === name)?.type, undefined, `${name} にtypeは不要`);
  }
});
