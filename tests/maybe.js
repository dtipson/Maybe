//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('Maybe.maybe runs a function on a Just or returns a default value on a Nothing', function (t) {

  var onJust = Maybe.maybe(2, x=>x+1, Just(9));
  var onNothing = Maybe.maybe(2, x=>x+1, Nothing);
  var withNothingOnJust = Maybe.maybe(Nothing, x=>x+1, Just(9));
  var withNothingOnNothing = Maybe.maybe(Nothing, x=>x+1, Nothing);

  t.same(onJust, 10, 'runs the function on value of the Just and returns the result');
  t.same(onNothing, 2, 'operating on a Nothing returns the default value');
  t.same(withNothingOnJust, 10, 'runs the function on value of the Just and returns the result');
  t.same(withNothingOnNothing, Nothing, 'operating on a Nothing returns the default value, a Nothing');
  t.end();
});