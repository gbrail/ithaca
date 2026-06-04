'use strict';

var {
  ArrayPrototypeJoin,
  ArrayPrototypeMap,
  JSONStringify,
  SafeSet
} = primordials;
var debug = require('internal/util/debuglog').debuglog('esm', fn => {
  debug = fn;
});

/**
 * Creates an import statement for a given module path and index.
 * @param {string} impt - The module path to import.
 * @param {number} index - The index of the import statement.
 * @returns {string}
 */
function createImport(impt, index) {
  var imptPath = JSONStringify(impt);
  return `import * as $import_${index} from ${imptPath};
import.meta.imports[${imptPath}] = $import_${index};`;
}

/**
 * Creates an export for a given module.
 * @param {string} expt - The name of the export.
 * @param {number} index - The index of the export statement.
 * @returns {string}
 */
function createExport(expt, index) {
  var nameStringLit = JSONStringify(expt);
  return `let $export_${index};
export { $export_${index} as ${nameStringLit} };
import.meta.exports[${nameStringLit}] = {
  get: () => $export_${index},
  set: (v) => $export_${index} = v,
};`;
}

/**
 * Creates a dynamic module with the given imports, exports, URL, and evaluate function.
 * @param {string[]} imports - An array of imports.
 * @param {string[]} exports - An array of exports.
 * @param {string} [url] - The URL of the module.
 * @param {(reflect: DynamicModuleReflect) => void} evaluate - The function to evaluate the module.
 * @typedef {object} DynamicModuleReflect
 * @property {Record<string, Record<string, any>>} imports - The imports of the module.
 * @property {string[]} exports - The exports of the module.
 * @property {(cb: (reflect: DynamicModuleReflect) => void) => void} onReady - Callback to evaluate the module.
 * @returns {object}
 */
var createDynamicModule = function (imports, exports) {
  var url = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
  var evaluate = arguments.length > 3 ? arguments[3] : undefined;
  debug('creating ESM facade for %s with exports: %j', url, exports);
  var source = `
${ArrayPrototypeJoin(ArrayPrototypeMap(imports, createImport), '\n')}
${ArrayPrototypeJoin(ArrayPrototypeMap(exports, createExport), '\n')}
import.meta.done();
`;
  var {
    registerModule,
    compileSourceTextModule,
    SourceTextModuleTypes: {
      kFacade
    }
  } = require('internal/modules/esm/utils');
  var m = compileSourceTextModule(`${url}`, source, kFacade);
  var readyfns = new SafeSet();
  /** @type {DynamicModuleReflect} */
  var reflect = {
    exports: {
      __proto__: null
    },
    onReady: cb => {
      readyfns.add(cb);
    }
  };
  if (imports.length) {
    reflect.imports = {
      __proto__: null
    };
  }
  registerModule(m, {
    __proto__: null,
    initializeImportMeta: (meta, wrap) => {
      meta.exports = reflect.exports;
      if (reflect.imports) {
        meta.imports = reflect.imports;
      }
      meta.done = () => {
        evaluate(reflect);
        reflect.onReady = cb => cb(reflect);
        for (var fn of readyfns) {
          readyfns.delete(fn);
          fn(reflect);
        }
      };
    }
  });
  return {
    module: m,
    reflect
  };
};
module.exports = createDynamicModule;

