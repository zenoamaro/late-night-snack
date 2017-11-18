const path = require('path');
const beautifyHtml = require('js-beautify').html;
const config = require('../config');

module.exports = function render(templateName, props) {
  const template = require(`${config.sources.templates}/${templateName}`);
  const output = template(props);
  return beautify(output);
}

function beautify(source) {
  return beautifyHtml(source, {
    brace_style: 'end-expand',
    end_with_newline: true,
    preserve_newlines: false,
  });
}
