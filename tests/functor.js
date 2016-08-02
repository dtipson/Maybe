//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('Identity', function (t) {

  const I = x=>x;
  const functor = Maybe.of(5)

  const left = functor.map(I);
  const right = functor;

  t.same(left, right, 'function with no effect returns functor with the same internal value');
  t.end();
});

test('Associativity', function (t) {

  const functor = Maybe.of(5);

  const f1 = x=>x+1;
  const f2 = x=>x*2;



  var left = functor.map(f1).map(f2);
  var right = functor.map( x => f2(f1(x)) );

  t.same(left, right, 'grouping of function operations does not change the result');
  t.end();
});