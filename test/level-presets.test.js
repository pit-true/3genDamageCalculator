const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScript } = require('./helpers/load-script');

test('Lvプリセットは指定された7段階を提供する', () => {
  const script = loadScript();

  assert.deepEqual(
    Array.from(script.evaluate('getLevelPresets()')),
    [5, 15, 20, 30, 50, 55, 100]
  );
});

test('攻撃側と防御側のLvプリセットはLv50を初期選択する', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  for (const side of ['attacker', 'defender']) {
    const select = html.match(
      new RegExp(`<select[^>]*id="${side}LevelPreset"[\\s\\S]*?<\\/select>`)
    )?.[0];
    assert.ok(select);
    for (const level of [5, 15, 20, 30, 50, 55, 100]) {
      assert.match(select, new RegExp(`<option value="${level}"`));
    }
    assert.match(select, /<option value="50" selected>/);
  }
});
