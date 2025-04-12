const packager = require('electron-packager');
const path = require('path');
const fs = require('fs');

async function bundleElectronApp() {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));

  const appPaths = await packager({
    dir: '.', // source folder
    out: 'dist/packaged',
    overwrite: true,
    arch: 'x64', // or 'arm64' or 'universal'
    platform: process.platform, // auto-detect (or 'darwin', 'win32', 'linux')
    prune: true,
    ignore: [/^\/frontend\/src/, /^\/node_modules\/\.cache/], // ignore dev-only stuff
    icon: path.join(__dirname, 'assets', 'icon.icns'), // or .ico for Windows
    name: pkg.productName || 'KafkaUI',
    appVersion: pkg.version,
    executableName: 'KafkaUI',
    afterCopy: [(buildPath, electronVersion, platform, arch, callback) => {
      console.log(`✅ Build ready at: ${buildPath}`);
      callback();
    }]
  });

  console.log(`✅ Packaged Electron app at: ${appPaths}`);
}

bundleElectronApp();