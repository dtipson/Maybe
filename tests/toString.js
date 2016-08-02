//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('null & undefined are falsy', function (t) {
  t.equals(Just(9).toString(), 'Just(9)', 'string representation of Justs');
  t.equals(Nothing.toString(), 'Nothing', 'string representation of Nothings');
  t.end();
});