/* eslint-env jasmine, jest */

import StyleRegistry from '../registry';

describe('apis/StyleSheet/registry', () => {
  beforeEach(() => {
    StyleRegistry.reset();
  });

  test('register', () => {
    const styles = { opacity: 0 };
    const ids = StyleRegistry.register(styles);

    expect(typeof ids === 'object').toBe(true);
  });

  describe('resolve', () => {
    const styleA = { borderWidth: 0, borderColor: 'red', width: 100 };
    const styleB = { position: 'absolute', left: 50, pointerEvents: 'box-only' };
    const styleC = { width: 200 };

    const testResolve = (a, b, c) => {
      // no common properties, different resolving order, same result
      const resolve1 = StyleRegistry.resolve({ style: [ a, b ] });
      expect(resolve1).toMatchSnapshot();
      const resolve2 = StyleRegistry.resolve({ style: [ b, a ] });
      expect(resolve1).toEqual(resolve2);

      // common properties, different resolving order, different result
      const resolve3 = StyleRegistry.resolve({ style: [ a, b, c ] });
      expect(resolve3).toMatchSnapshot();
      const resolve4 = StyleRegistry.resolve({ style: [ c, a, b ] });
      expect(resolve4).toMatchSnapshot();
      expect(resolve3).not.toEqual(resolve4);
    };

    test('with register, resolves to className', () => {
      const a = StyleRegistry.register(styleA);
      const b = StyleRegistry.register(styleB);
      const c = StyleRegistry.register(styleC);
      testResolve(a, b, c);
    });

    test('with register, resolves to mixed', () => {
      const a = styleA;
      const b = StyleRegistry.register(styleB);
      const c = StyleRegistry.register(styleC);
      testResolve(a, b, c);
    });

    test('without register, resolves to inline styles', () => {
      testResolve(styleA, styleB, styleC);
    });
  });
});
