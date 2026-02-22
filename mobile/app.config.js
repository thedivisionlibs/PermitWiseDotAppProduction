// app.config.js
const { withAppBuildGradle } = require("@expo/config-plugins");

function withReactNativeIapStore(config) {
  return withAppBuildGradle(config, (config) => {
    let s = config.modResults.contents;

    if (!s.includes('missingDimensionStrategy "store", "play"')) {
      s = s.replace(
        /defaultConfig\s*{\s*/m,
        (match) => `${match}        missingDimensionStrategy "store", "play"\n`
      );
      config.modResults.contents = s;
    }

    return config;
  });
}

module.exports = ({ config }) => {
  config.plugins = config.plugins || [];
  config.plugins.push(withReactNativeIapStore);
  return config;
};
