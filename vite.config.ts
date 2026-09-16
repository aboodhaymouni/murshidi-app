import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Three builds come out of this one source:
//
//   npm run build          base '/',              key from .env.local if present
//                          → local preview and the Capacitor APK
//   npm run build:pages    base '/murshidi-app/', key FORCED EMPTY
//                          → the public GitHub Pages artifact
//   npm run build:apk      base '/',              key from .env.local
//                          → the Android bundle, where the key ships on purpose
//
// The router is a HashRouter, so only asset URLs need the base; there is no
// server-side rewrite to configure.
//
// Why `define` and not an empty environment variable: Vite loads .env.local for
// every mode and it wins over a bare `VITE_OPENROUTER_KEY=` on the command line,
// so the shell cannot be trusted to strip the key. Replacing the expression at
// compile time can't be defeated by a stray dotenv file — and GitHub's push
// protection, which already rejected one of these bundles, is the backstop that
// proves it.
const stripKey = process.env.MURSHIDI_PUBLIC_BUILD === '1'

export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  ...(stripKey
    ? { define: { 'import.meta.env.VITE_OPENROUTER_KEY': JSON.stringify('') } }
    : {}),
})
