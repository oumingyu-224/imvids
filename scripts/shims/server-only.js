/**
 * Shim for running Node scripts (tsx) that import 'server-only'.
 *
 * Next.js intercepts `import 'server-only'` at build time and never actually
 * loads the package, so bundling is fine. Plain Node (tsx scripts) has no such
 * interceptor, and the real package throws on load. This shim, injected via
 * NODE_OPTIONS=--require, maps 'server-only' to an empty module instead.
 */
const Module = require('module');

const originalLoad = Module._load;

Module._load = function (request, parent, isMain) {
  if (request === 'server-only') {
    return {};
  }
  return originalLoad.apply(this, arguments);
};
