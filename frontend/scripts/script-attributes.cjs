// Read actual attributes, never data-type/data-src or text inside another value.
// Duplicate attributes use the first value, matching the HTML parser.
function scriptAttributes(source) {
  const attributes = new Map();
  const pattern = /([^\s=/'"<>`]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    const name = match[1].toLowerCase();
    if (!attributes.has(name)) {
      attributes.set(name, match[2] ?? match[3] ?? match[4] ?? '');
    }
  }
  return attributes;
}

module.exports = { scriptAttributes };
