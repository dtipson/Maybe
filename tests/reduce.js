//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('reduce', function (t) {

  const takeValue = Just(5).reduce( (acc, x) => x, Nothing);
  const toArray = Just(5).reduce( (acc, x) => acc.concat(x), [8]);
  const toNumber = Just(5).reduce( (acc, x) => acc+x, 8);
  const reduceNothing = Nothing.reduce( (acc, x) => x, 5);

  t.equals(takeValue, 5, 'returning the contained item returns the inner value');
  t.same(toArray, [8,5], 'transform Just to an array');
  t.equals(toNumber, 13, 'transform Just to an Number');
  t.equals(reduceNothing, 5, 'reducing on a Nothing = accumulator is returned unaltered');
  t.end();
});