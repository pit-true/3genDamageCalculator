const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const assert = require('node:assert/strict');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

test('左右の見出しは簡潔な「攻撃側」「防御側」と表示する', () => {
  assert.match(html, /<h2>攻撃側<\/h2>/);
  assert.match(html, /<h2>防御側<\/h2>/);
  assert.doesNotMatch(html, /<h2>攻撃側ポケモン<\/h2>/);
  assert.doesNotMatch(html, /<h2>防御側ポケモン<\/h2>/);
});
