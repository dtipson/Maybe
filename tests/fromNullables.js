//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('null & undefined are falsy', function (t) {
  t.ok(Maybe.isNull(null), 'nulls are falsy');
  t.ok(Maybe.isNull(undefined), 'undefineds are falsy');
  t.end();
});

test('empty is Nothing', function (t) {
  t.same(Maybe.empty(), Nothing, 'empty is a Nothing');
  t.end();
});

test('fromNullable', function (t) {
  t.same(Maybe.fromNullable(null), Nothing, 'from null is Nothing');
  t.same(Maybe.fromNullable(undefined), Nothing, 'from null is Nothing');
  t.same(Maybe.fromNullable(5), Just(5), 'from 5 is Just 5');
  t.end();
});