'use strict'

var rules = {
  docs: require('./rules/docs'),
}

module.exports = {
  rules,
  configs: {
    recommended: {
      plugins: ['react-hooks-docs'],
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      rules: {
        'react-hooks-docs/docs': 2,
      },
    },
  },
}
