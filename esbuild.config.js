require('esbuild').build({
    entryPoints: ['main.ts'],
    outfile: 'dist/main.js',
    bundle: true,
    platform: 'node',
    external: ['electron'], // don't bundle Electron
    target: 'node20',
  }).catch(() => process.exit(1));
