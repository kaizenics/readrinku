// Monorepo-aware Metro config. See https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// 1. Watch the whole workspace so changes to packages/core are picked up and its
//    raw TypeScript source is transpiled by Metro.
config.watchFolders = [workspaceRoot];

// 2. Resolve modules from the app first, then fall back to the workspace root
//    (where pnpm's hoisted node_modules and the @rinku/* symlinks live).
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = config;
