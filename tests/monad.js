//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');


//with Something!
test('Left Identity', function (t) {

  const testFunc = x=> Maybe.of(x+1);
  const testValue = 6;

  const left = Maybe.of(testValue).chain(testFunc);
  const right = testFunc(testValue)

  t.same(left, right, 'same internal value');
  t.end();
});


test('Right Identity', function (t) {

  const testValue = 6;
  const typeValue = Maybe.of(testValue);

  const left = typeValue.chain(Maybe.of);
  const right = typeValue;


  t.same(left, right, 'same internal value');
  t.end();
});


test('Associativity', function (t) {

  const f = a => Maybe.of(a * a);
  const g = a => Maybe.of(a - 6);
  const m = Maybe.of(7);


  const left = m.chain(f).chain(g);
  const right = m.chain( x => f(x).chain(g) );

  t.same(left, right, 'same internal value');
  t.end();
});







//with Nothing!
test('Left Identity', function (t) {

  const testFunc = x => Nothing;
  const testValue = 6;

  const left = Nothing.chain(testFunc);
  const right = testFunc(testValue)

  t.same(left, right, 'same internal value');
  t.end();
});


test('Right Identity', function (t) {

  const testValue = 6;
  const typeValue = Nothing;

  const left = typeValue.chain(Maybe.of);
  const right = typeValue;


  t.same(left, right, 'same internal value');
  t.end();
});


test('Associativity', function (t) {

  const f = a => Nothing;
  const g = a => Nothing;
  const m = Nothing;


  const left = m.chain(f).chain(g);
  const right = m.chain( x => f(x).chain(g) );

  t.same(left, right, 'same internal value');
  t.end();
});