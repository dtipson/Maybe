require('./src/other-types/Array-helpers.js');
require('./src/other-types/Promise-helpers.js');

const Writer = require('./src/other-types/Writer.js');
const Reader = require('./src/other-types/Reader.js');
const IO = require('./src/other-types/IO.js');

Object.assign(
  window, 
  require('./src/Maybe.js'),
  {Reader,Writer,IO},
  require('./src/other-types/pointfree.js')
);