const config = require('../config');


/**
 * Splits source code into sections, one for each jsdoc comment block,
 * and the source code that follows it, if any. 
 * 
 * The code is processed line by line, and only comment blocks that
 * use the `/**` marker are extracted.
 */
module.exports = function annotate(source) {
  let sections = [];
  let currentSection = null;
  let isCommentBlock = false;
  
  source.split('\n').forEach((line) => {
    // Starting a comment section
    if (line.includes('/**')) {
      isCommentBlock = true;
      currentSection = null;
    }
    
    // Creating a new section if needed
    if (!currentSection) {
      currentSection = {annotation:[], source:[]};
      sections.push(currentSection);
    }
    
    // Extracting the comment or the source code bloxk
    if (isCommentBlock) {
      const text = line.replace(/^(\s*(\/\*\*|\*\/|\*) ?)/g, '');
      currentSection.annotation.push(text);
    } else {
      // Detect executable code
      if (line.includes('function main')) {
        currentSection.editable = true;
        currentSection.executable = true;
      }
      currentSection.source.push(line);
    }
    
    // End comment section
    if (isCommentBlock && line.includes('*/')) {
      isCommentBlock = false;
    } 
  });

  // Trim empty lines at boundaries
  sections.forEach(({annotation, source}) => {
    for (let block of [annotation, source]) {
      while (block.length && !block[0]) block.shift();
      while (block.length && !block[block.length-1]) block.pop();
    }
  });
  
  // Strip empty sections
  sections = sections.filter(({annotation, source}) => {
    return annotation.length || source.length;
  });

  // Ensure compliancy
  if (sections[0].annotation.length === 0) {
    throw new Error('The listing must start with an annotation');
  }
  if (sections[0].source.length > 0) {
    throw new Error('The first annotation must not contain source');
  }
  if (!sections[0].annotation[1].includes('===')) {
    throw new Error('The first annotation must start with a title');
  }

  return sections;
}
