//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('sequence', function (t) {


  t.same(Just([5,6]).sequence(Array.of), [Just(5),Just(6)], 'flips types');
  t.same(Nothing.sequence(Array.of), [Nothing], 'flips types');
  t.end();
});


test('traverse', function (t) {

  t.same(Just([5,6]).traverse(x=>x.map(x=>x+1), Array.of), [Just(6),Just(7)], 'maps and flips types');
  t.same(Nothing.traverse(x=>x+1, Array.of), [Nothing], 'maps and flips types');
  t.end();
});