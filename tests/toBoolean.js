//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('toBoolean', function (t) {
  t.ok(!Maybe.toBoolean(Nothing), 'nulls are falsy');
  t.ok(Maybe.toBoolean(Just(9)), 'Justs are truthy');
  t.end();
});


test('toBoolean', function (t) {
  t.equals(Just(9).toBoolean(), true, 'Justs are truthy');
  t.equals(Nothing.toBoolean(), false, 'Justs are truthy');
  t.end();
});