/**
 * Returns a space-separated string of all the keys in the object
 * whose value is truthy. Mostly useful when producing css classes.
 * 
 * cls({ button:true, primary:true, hover:false });
 * > "button primary"
 */
exports.classes = function cls(classes) {
  return Object.entries(classes)
    .map(([key, value]) => value? key : '')
    .join(' ');
}

/**
 * Formats a template string so that various data types are rendered
 * in a useful way.
 * 
 * tmpl`
 *   <ul class="${{button:true, hover:false}}">
 *     ${numbers.map(x => tmpl`<li>${x}</li>`)}
 *   </ul>
 * `;
 * 
 * > "
 * >   <ul class="button">
 * >     <li>1</li>
 * >     <li>2</li>
 * >     <li>3</li>
 * >   </ul>
 * > "
 */
exports.template = function tmpl(strings, ...args) {
	return strings.reduce((result, str, i) => {
    let arg = args[i];
    
    // Falsy values are removed from output
    if (!arg) arg = '';
    // Arrays are joined together as strings
    else if (arg instanceof Array) arg = arg.join('');
    // Objects will become a string containg their truthy keys
    else if (typeof arg === 'object') arg = exports.classes(arg);
    // Everything else is simply stringified
    else arg = arg.toString();
    
    return result + str + arg;
  }, '');
}

exports.formatFileSize = function formatFileSize(size) {
  const kb = Math.round(size / 1024);
  return `${kb}KB`;
}

exports.formatDate = function formatDate(date) {
  const day = `${date.getDate()}`.padStart(2, '0');
  const month = `${date.getMonth()+1}`.padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}