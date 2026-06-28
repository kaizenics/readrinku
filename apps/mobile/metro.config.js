// Monorepo-aware Metro + Uniwind (Tailwind v4 bindings for RN).
// https://docs.uniwind.dev/api/metro-config
const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole workspace so changes to packages/core are picked up and its
//    raw TypeScript source is transpiled by Metro.
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from the app first, then the hoisted workspace root.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
});
