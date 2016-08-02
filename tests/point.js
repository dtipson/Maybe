//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('concat', function (t) {
  t.same(Maybe.of(9), Just(9), 'Maybe.of == Just.of');
  t.same(Maybe.of(null), Just(null), 'internal value can be null if forced to be so');
  t.end();
});