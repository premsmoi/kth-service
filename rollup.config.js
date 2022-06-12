import typescript from '@rollup/plugin-typescript';
import { terser } from "rollup-plugin-terser";

export default {
  input: 'src/server.ts',
  output: {
    dir: 'dist',
    format: 'cjs',
    compact: true,
  },
  plugins: [typescript(), terser()]
};