const path = require('path');
const dotenv = require('dotenv');

module.exports = api => {
  api.cache(false);
  dotenv.config({
    path: path.resolve(__dirname, '.env'),
    override: true,
  });

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'module:react-native-dotenv',
        {
          moduleName: '@env',
          path: '.env',
          safe: true,
          allowUndefined: false,
        },
      ],
    ],
  };
};
