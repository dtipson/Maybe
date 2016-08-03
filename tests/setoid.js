//const test = require('tape');
const test = require('tap').test;//more verbose

const {Just,Nothing} = require('../src/Maybe.js');

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


test('reflexivity', function (t) {
  const x = Just(5);

  t.ok(x.equals(x), 'value in type === itself in the same type');
  t.ok(Nothing.equals(Nothing));
  t.end();
});

test('symmetry', function (t) {
  const x = 5;

  const f = Just(x);
  const g = Just(x);

  t.ok(f.equals(g) && g.equals(f), 'if x===y then y===x');

  t.end();
});


test('transitivity', function (t) {

  const x = 5;

  const f = Just(x);
  const g = Just(x);
  const h = Just(x);

  const a = f.equals(g);
  const b = g.equals(h);
  const c = f.equals(h);

  t.ok(a && b && c,'if f===g and g===h, f===h');
  t.end();
});