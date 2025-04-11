import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: 'dist/ellipsis-id.umd.js',
      format: 'umd',
      name: 'BrowserShield',
      sourcemap: true
    },
    {
      file: 'dist/ellipsis-id.umd.min.js',
      format: 'umd',
      name: 'BrowserShield',
      plugins: [terser()],
      sourcemap: true
    },
    {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    }
  ],
  plugins: [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false
    }),
    resolve(),
    commonjs()
  ]
};