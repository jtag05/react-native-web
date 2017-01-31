/**
 * WARNING: changes to this file in particular can cause significant changes to
 * the results of render performance benchmarks.
 */
import jss from 'jss';
import preset from 'jss-preset-default';
import ReactNativePropRegistry from '../../modules/ReactNativePropRegistry';

// I'm assuming this only needs to be setup once per app, not per file
let jssSetup = false;
const sheets = [];
const sheetMapToRegistry = {};

if (!jssSetup) {
  jss.setup(preset());
  jssSetup = true;
}

const resolveClassName = (style) => {
  if (typeof style === 'number') {
    return sheetMapToRegistry[style];
  } else if (Array.isArray(style)) {
    return style.map((s, i) => {
      const rs = resolveClassName(s);

      return rs && i > 0 ? ` ${rs}` : rs;
    }).join('');
  } else if (typeof style === 'object') {
    const className = 'generated-class';
    const styles = {
      [className]: style // inline style object NOT from `StyleSheet.create()`
    };

    const jssObj = jss.createStyleSheet(styles).attach(); // append generated selector+style to the DOM
    sheets.push(jssObj);

    return jssObj.classes[className];
  } else {
    return undefined;
  }
};

/**
 * Web style registry
 */
const StyleRegistry = {

  reset() {
    sheets.forEach((val, key) => {
      jss.removeStyleSheet(sheets[key]);
    });
  },

  register(style) {
    const jssObj = jss.createStyleSheet(style).attach();
    const result = {};

    sheets.push(jssObj);

    for (const key in jssObj.classes) {
      const className = jssObj.classes[key];

      if (process.env.NODE_ENV !== 'production') {
        require('./StyleSheetValidation').validateStyle(className, jssObj.rules.map[key].originalStyle);
      }
      const id = ReactNativePropRegistry.register(jssObj.rules.map[key].originalStyle);

      result[key] = id;
      sheetMapToRegistry[id] = className;
    }
    return result;
  },

  resolve(props) {
    if (!props || !props.style) {
      return { className: props.className || undefined };
    }
    const className = `${props.className || ''}${resolveClassName(props.style)}`.trim();

    return { className }; // note: we'll deal with display and pointer events `styleAsClassName` if we go this route
  }
};

module.exports = StyleRegistry;
