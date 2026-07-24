const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadScript } = require('./helpers/load-script');

test('デスクトップ版Chromeではスライダー操作を有効にする', () => {
  const script = loadScript();

  assert.equal(script.evaluate(`
    window.innerWidth = 1440;
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 Chrome/126.0.0.0 Safari/537.36'
    });
    shouldUseSliderControls();
  `), true);
});

test('Chromium版EdgeをChromeとして誤判定しない', () => {
  const script = loadScript();

  assert.equal(script.evaluate(`
    window.innerWidth = 1440;
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 Chrome/126.0.0.0 Safari/537.36 Edg/126.0.0.0'
    });
    shouldUseSliderControls();
  `), false);
});

test('モバイル幅ではブラウザに関係なくスライダー操作を有効にする', () => {
  const script = loadScript();

  assert.equal(script.evaluate(`
    window.innerWidth = 390;
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 Firefox/127.0'
    });
    shouldUseSliderControls();
  `), true);
});

test('デスクトップでもスライダーを画面下部に配置できる', () => {
  const style = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
  const baseRule = style.match(/\.mobile-control-bar\s*\{([^}]*)\}/)?.[1] || '';

  assert.match(baseRule, /left:\s*20px/);
  assert.match(baseRule, /right:\s*20px/);
  assert.match(baseRule, /bottom:\s*30px/);
});
