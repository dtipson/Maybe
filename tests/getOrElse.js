//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('Nothing.getOrElse', function (t) {
  t.equals(Nothing.getOrElse(6), 6, 'value is returned for a Nothing');
  t.equals(Just(9).getOrElse(6), 9, 'original value is returned for a Just');
  t.end();
});