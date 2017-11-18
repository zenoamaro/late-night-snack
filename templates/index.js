const marked = require('marked');
const {template, formatDate, formatFileSize} = require('../src/utils');
const baseTemplate = require('./base');
const config = require('../config');

const renderCover = () => template`
  <header id="cover">
    <h1 class="title">${config.site.title}</h1>
    <div class="subtitle">${config.site.subtitle}</div>
  </header>
`;

const renderArticles = ({articles}) => template`
  <section id="articles">
    <ul class="list">
      ${articles.map(renderArticle)}
    </ul>
  </section>
`;

const renderArticle = ({slug, date, title, size, basename}) => template`
  <li class="article">
    <a class="link" href="${slug}.html">${title} <span class="size">(${formatFileSize(size)})</span></a>
    <time datetime="${date.toISOString()}" class="date">${formatDate(date)}</time>
  </li>
`;

const renderAbout = ({aboutText}) => template`
  <section id="about">
    ${marked(aboutText.split('---')[1])}
  </section>
`;

const renderFooter = () => template`
  <footer id="footer">
    ${config.site.copyright}
  </footer>
`;

const renderPage = ({articles, aboutText}) => template`
  ${renderCover()}
  ${renderArticles({articles})}
  ${renderAbout({aboutText})}
  ${renderFooter()}
`;

module.exports = ({articles, aboutText}) => baseTemplate({
  gitHubLink: config.site.gitHubLink,
  content: renderPage({articles, aboutText}),
});