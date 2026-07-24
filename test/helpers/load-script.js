const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createElementStub() {
  const noop = () => {};
  return new Proxy({}, {
    get(_target, property) {
      if (property === 'addEventListener') return noop;
      if (property === 'classList') {
        return { add: noop, remove: noop, toggle: noop };
      }
      if (property === 'style') return {};
      if (property === 'value') return '';
      if (property === 'checked') return false;
      return noop;
    }
  });
}

function loadScript() {
  const noop = () => {};
  const element = createElementStub();
  const document = new Proxy({}, {
    get(_target, property) {
      if (property === 'addEventListener') return noop;
      if (property === 'getElementById') return () => null;
      if (property === 'querySelector') return () => null;
      if (property === 'querySelectorAll') return () => [];
      if (property === 'createElement') return () => element;
      if (property === 'body') return element;
      return noop;
    }
  });
  const context = vm.createContext({
    document,
    window: { innerWidth: 1200, addEventListener: noop },
    console,
    fetch: async () => ({ json: async () => [] }),
    localStorage: { getItem: () => null, setItem: noop },
    navigator: {},
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval
  });

  const source = fs.readFileSync(
    path.join(__dirname, '..', '..', 'script.js'),
    'utf8'
  );
  vm.runInContext(source, context);

  return {
    evaluate(expression) {
      return vm.runInContext(expression, context);
    }
  };
}

module.exports = { loadScript };
