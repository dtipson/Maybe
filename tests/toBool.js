//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('toBool', function (t) {
  t.ok(!Maybe.toBool(Nothing), 'nulls are falsy');
  t.ok(Maybe.toBool(Just(9)), 'Justs are truthy');
  t.end();
});
