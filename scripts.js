// Highlight all source code blocks in the article
document.querySelectorAll('#article .source code').forEach((block) => {
  hljs.highlightBlock(block);
});