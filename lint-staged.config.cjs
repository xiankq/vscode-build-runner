/** @type {import('lint-staged').Configuration} */
module.exports = {
  '*': 'eslint --fix',
  '*.ts': [() => 'tsc --noEmit --pretty false'],
};
