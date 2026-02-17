const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Exclude test files from Metro bundling (Expo Router treats files in app/ as routes)
config.resolver.blockList = [
  ...(config.resolver.blockList || []),
  /\.test\.(ts|tsx|js|jsx)$/,
  /\.spec\.(ts|tsx|js|jsx)$/,
];

module.exports = config;
