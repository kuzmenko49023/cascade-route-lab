module.exports = {
  preset: 'react-native',
  // the icon library and react-native-svg ship untranspiled ESM
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|lucide-react-native|react-native-svg)/)',
  ],
};
