//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('filter', function (t) {

  const filterJust = Just(5).filter( x => x===5 );
  const filterJustFail = Just(9).filter( x => x===5 );

  t.same(filterJust, Just(5), 'inner value is ok, remains a Just 5');
  t.same(filterJustFail, Nothing, 'inner value fails the test, returns a Nothing');
  t.end();
});