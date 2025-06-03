'use strict';

const init = require('eslint-config-metarhia');

module.exports = [
  {
    files: ['./'],
    rules: init,
  },
  {
    files: ['src/frontend'],
    rules: {
      ...init,
      sourceType: 'module',
    },
  },
];
