// Learn more https://docs.expo.dev/guides/monorepos
// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @type {import('expo/metro-config')}
 */
const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.disableHierarchicalLookup = true

// Cấu hình SVG transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
}

const aliasMap = {
  'components': path.resolve(workspaceRoot, 'packages/components'),
  'app': path.resolve(workspaceRoot, 'packages/app'),
  '@tokki/app': path.resolve(workspaceRoot, 'packages/app'),
  'assets': path.resolve(workspaceRoot, 'packages/assets'),
}

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
  sourceExts: [...config.resolver.sourceExts, 'svg'],
  alias: aliasMap,
  resolveRequest: (context, moduleName, platform) => {
    for (const prefix of Object.keys(aliasMap)) {
      if (moduleName === prefix || moduleName.startsWith(prefix + '/')) {
        const resolved = aliasMap[prefix] + moduleName.slice(prefix.length)
        return context.resolveRequest(context, resolved, platform)
      }
    }
    return context.resolveRequest(context, moduleName, platform)
  },
}

module.exports = config
