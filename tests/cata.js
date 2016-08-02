//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('cata', function (t) {

  const toTen ={
    Just: x=>x+5,
    Nothing: x=>10
  };

  t.same(Just(5).cata(toTen), 10, 'returns 10 for Just');
  t.same(Nothing.cata(toTen), 10, 'returns 10 for Nothing');
  t.end();
});