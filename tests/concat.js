//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('concat', function (t) {
  t.same(Just([1]).concat(Just([9])), Just([1,9]), 'values in Justs are concatted');
  t.same(Nothing.concat(Just([9])), Just([9]), 'nothing is the empty value');
  t.end();
});