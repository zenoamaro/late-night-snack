const fs = require('fs');
const marked = require('marked');
const {template} = require('../src/utils');
const baseTemplate = require('./base');
const annotate = require('../src/annotate');
const config = require('../config');

const renderNavigation = () => template`
  <nav id="navigation">
    <div class="navigation-content">
      <a href="/" rel="index" class="link title">${config.site.title}</a>
      <a href="/" rel="index" class="link index">&lt;&lt; All listings</a>
    </div>
  </nav>
`;

const renderAnnotation = ({annotation}) => template`
  <div class="annotation">
    <div class="wrapper">
      ${marked(annotation.join('\n'))}
    </div>
  </div>
`;

const renderSource = ({source, editable, executable}) => (
  source.length && template`
    <div class="source ${{editable, executable}}">
      <code>${source.join('\n')}</code>
    </div>
  `
);

const renderSection = ({annotation, source, editable, executable}) => template`
  <div class="section ${{'no-source': source.length === 0}}">
    <div class="section-content">
      ${renderAnnotation({annotation})}
      ${renderSource({source, editable, executable})}
    </div>
  </div>
`;

const renderArticle = ({content}) => template`
  <div id="article">
    ${annotate(content).map(renderSection)}
  </div>
`;

const renderPage = ({article, content}) => template`
  ${renderNavigation()}
  ${renderArticle({content})}
  ${renderNavigation()}
`;

module.exports = ({article, content}) => baseTemplate({
  gitHubLink: `${config.site.gitHubLink}/blob/master/${article.filename}`,
  styles: [
    'syntax.css'
  ],
  scripts: [
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/highlight.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/9.12.0/languages/javascript.min.js',
    'scripts.js',
  ],
  content: renderPage({article, content}),
});