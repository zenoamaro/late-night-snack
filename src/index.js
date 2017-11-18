const fs = require('fs');
const path = require('path');
const glob = require('glob');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const slugify = require('slug');
const render = require('./render');
const config = require('../config');


console.log(`Directing output to: ${config.output}`); // ---------------
mkdirp.sync(config.output);


console.log(`Cleaning...`); // ---------------------------------------
rimraf.sync(`${config.output}/**/*.*`);


console.log('Table of contents...'); // ------------------------------

const POST_FILENAME_PATTERN = /^(\d{4}-\d{2}-\d{2}) ([\w\d- ]+)$/;
let articles = glob.sync('*.js', {cwd:config.sources.articles});

articles = articles.map((filename) => {
  const fullpath = path.join(config.sources.articles, filename);
  const basename = path.basename(filename, '.js');
  const [match, date, title] = basename.match(POST_FILENAME_PATTERN);
  if (!match) throw new Error(
    `Filename "${basename}" should be in form "YYYY-MM-DD Title.js"`
  );
  const slug = slugify(`${date}-${title}`).toLowerCase();
  const size = fs.statSync(fullpath).size;
  return {filename, fullpath, title, slug, size, date: new Date(date)};
});

articles.sort((a, b) => b.date.getTime() - a.date.getTime());


console.log('Generating index...'); // -------------------------------

const aboutText = fs.readFileSync(config.sources.about)
  .toString();

fs.writeFileSync(
  path.join(config.output, 'index.html'),
  render('index', {articles, aboutText})
);


console.log('Generating articles...'); // -------------------------------

articles.forEach((article) => {
  console.log(`- ${article.title}`);
  const content = fs.readFileSync(article.fullpath).toString();
  const output = render('article', {article, content});
  const dest = path.join(config.output, `${article.slug}.html`);
  fs.writeFileSync(dest, output);
});


console.log('Copying static files...'); // ---------------------------

glob.sync('*.*', {cwd:config.sources.statics}).forEach((filename) => {
  console.log(`- ${filename}`);
  const src = path.join(config.sources.statics, filename);
  const dest = path.join(config.output, filename);
  mkdirp.sync(path.dirname(dest));
  fs.copyFileSync(src, dest);
});
