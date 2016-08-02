//const test = require('tape');
const test = require('tap').test;//more verbose

const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('Nothing equals nothing, not something', function (t) {
  t.equals(Nothing.equals(Nothing), true,'Nothing equals nothing');
  t.equals(Nothing.equals(Just(9)), false,'Nothing does not equal something');
  t.end();
});

test('Someting equals the same something', function (t) {
  t.equals(Just(5).equals(Just(5)), true,'Just 5 equals Just 5 ');
  t.equals(Just(5).equals(Just(9)), false,'Just 5  does not equal Just 9');
  t.end();
});