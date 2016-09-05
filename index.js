require('./src/other-types/Array-helpers.js');
require('./src/other-types/Promise-helpers.js');
const Const = require('./src/other-types/Const.js');
const Continuation = require('./src/other-types/Continuation.js');//total nonsense, really
const Identity = require('./src/other-types/Identity.js');
const IO = require('./src/other-types/IO.js');
const Reader = require('./src/other-types/Reader.js');
const State = require('./src/other-types/State.js');
const Store = require('./src/other-types/Store.js');
const Tuple = require('./src/other-types/Tuple.js');
const Writer = require('./src/other-types/Writer-array.js');

Object.assign(
  window, 
  require('./src/Maybe.js'),
  require('./src/media-recorder/videobooth.js'),
  require('./src/other-types/Either.js'),
  {Const, Continuation, Cont:Continuation, Identity, IO, Reader, Tuple, State, Store, Writer},
  require('./src/other-types/pointfree.js'),
  require('./src/other-types/monoids.js'),
  require('./src/other-types/Validation.js'),
  require('./src/other-types/utility.js')
);