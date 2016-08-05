//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('getOrElse', function (t) {
  t.equals(Nothing.getOrElse(6), 6, 'value is returned for a Nothing');
  t.equals(Just(9).getOrElse(6), 9, 'original value is returned for a Just');
  t.end();
});

test('orElse', function (t) {
  t.same(Nothing.orElse(Just(6)), Just(6), 'value is returned for a Nothing');
  t.same(Just(9).orElse(Just(6)), Just(9), 'original wrapped value is returned for a Just');
  t.end();
});