const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Set the project root to the app directory
config.projectRoot = __dirname

// Ensure node_modules resolution works correctly in monorepo
config.watchFolders = [__dirname]

module.exports = config


