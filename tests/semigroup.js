//const test = require('tape');
const test = require('tap').test;//more verbose


const {Just, Nothing} = require('../src/Maybe.js');

test('basic concat', function (t) {
  t.same(Just([1]).concat(Just([9])), Just([1,9]), 'values in Justs are concatted');
  t.same(Nothing.concat(Just([9])), Just([9]), 'nothing is the empty value');
  t.end();
});


test('associativity: a.concat(b).concat(c)` is equivalent to `a.concat(b.concat(c))', function (t) {

  const one = Just([1]);
  const two = Just([2]);
  const three = Just([3]);

  const left = one.concat(two).concat(three);
  const right = one.concat(two.concat(three));

  t.same(left, right, 'grouping of operations should not matter');
  t.end();
});