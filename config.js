const path = require('path');

exports.site = {
  title: 'Late Night Snack',
  subtitle: 'Grab your cup, rock your chair, enjoy some code',
  copyright: 'Late Night Snack is written by <a href="https://github.com/zenoamaro">zenoamaro</a>, and is licensed under the <a href="https://creativecommons.org/licenses/by-nc-sa/4.0">CC BY-NC-SA 4.0</a> license.',
  url: 'https://latenightsnack.io',
  gitHubLink: 'https://github.com/zenoamaro/late-night-snack',
  author: 'zenoamaro (zenoamaro@gmail.com)',
  homepage: 'https://github.com/zenoamaro',
};

exports.sources = {
  statics:   path.join(__dirname, 'statics'),
  templates: path.join(__dirname, 'templates'),
  articles:  path.join(__dirname, '../articles'),
  about:     path.join(__dirname, '../articles/README.md'),
};

exports.output = path.join(__dirname, '../output');
