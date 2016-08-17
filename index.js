require('./src/other-types/Array-helpers.js');
require('./src/other-types/Promise-helpers.js');
const Const = require('./src/other-types/Const.js');
const Writer = require('./src/other-types/Writer.js');
const Tuple = require('./src/other-types/Tuple.js');
const Reader = require('./src/other-types/Reader.js');
const IO = require('./src/other-types/IO.js');

Object.assign(
  window, 
  require('./src/Maybe.js'),
  {Const,Reader,Writer,IO,Tuple},
  require('./src/other-types/pointfree.js'),
  require('./src/other-types/utility.js')
);