module.exports = {
  preset: 'jest-expo',
  moduleNameMapper: {
    '^react-native/asset-registry$':
      '<rootDir>/node_modules/react-native/src/asset-registry.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|expo-router|react-native-gesture-handler))',
  ],
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
};
