// The whole test runner, in one file.
//
// `npm test` runs Node's own test runner over TypeScript sources with
// --experimental-strip-types. Stripping types is all Node does: it never
// rewrites a module specifier, so `import … from './tawjihi.data'` — written
// the way a bundler expects — fails to resolve under plain ESM rules.
//
// This registers one synchronous resolve hook that retries a failed relative
// specifier with a TypeScript extension. It is deliberately the smallest thing
// that works: the repo has no test framework, and adding one to run a handful
// of assertions against a generated data module would be a heavier dependency
// than the problem deserves.
import { registerHooks } from 'node:module';

const TS_EXTENSIONS = ['.ts', '.tsx', '/index.ts', '/index.tsx'];

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith('./') && !specifier.startsWith('../')) {
      return nextResolve(specifier, context);
    }
    try {
      return nextResolve(specifier, context);
    } catch (error) {
      if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
      for (const extension of TS_EXTENSIONS) {
        try {
          return nextResolve(specifier + extension, context);
        } catch {
          /* try the next candidate extension */
        }
      }
      throw error;
    }
  },
});
