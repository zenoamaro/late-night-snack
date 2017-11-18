const {template} = require('../src/utils');
const {site} = require('../config');

const renderGitHubLink = ({link, title='See on GitHub'}) => template`
  <a href="${link}" title="${title}">
    <img id="github-link" src="github.svg" alt="${title}">
  </a>
`;

module.exports = ({gitHubLink, scripts=[], styles=[], content}) => template`
  <!DOCTYPE html>
  <html lang="en">
  
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="author" content="${site.author}">
    <link rel="author" href="${site.homepage}">
    <title>${site.title}</title>
    <link rel="stylesheet" href="styles.css"/>
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=VT323|Source+Sans+Pro:400,400i,600"/>
    ${styles.map(href => `<link rel="stylesheet" href="${href}"/>`)}
  </head>
  
  <body>
    ${content}
    ${gitHubLink && renderGitHubLink({link: gitHubLink})}
    ${scripts.map(src => `<script src="${src}"></script>`)}
  </body>
  
  </html>
`;