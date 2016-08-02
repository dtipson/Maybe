//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('Identity', function (t) {

  const I = x=>x;
  const mValue = Maybe.of(9);
  const applicative = Maybe.of(I)

  const left = applicative.ap(mValue);
  const right = mValue;

  t.same(left, right, 'applying Identity to a monadic value returns the same value');
  t.end();
});


test('Homomorphism', function (t) {

  const testFunc = x=>x+1;
  const testValue = 5;

  const left = Maybe.of(testFunc).ap(Maybe.of(testValue));
  const right = Maybe.of(testFunc(testValue));

  t.same(left, right, 'in-container operations == operations then put into a container');
  t.end();
});


test('Interchange', function (t) {

  const testFunc = x=>x+1;
  const applicative = Maybe.of(testFunc)
  const testValue = 5;

  const left = applicative.ap(Maybe.of(testValue));
  const right = Maybe.of(function(f){return f(testValue)}).ap(applicative)

  t.same(left, right, 'function can be lifted to the right or the left, should not matter');
  t.end();
});


// const compose  = (fn, ...rest) =>
//   rest.length === 0 ?
//     (fn||(x=>x)) :
//     (...args) => fn(compose(...rest)(...args));

// test('Composition', function (t) {

//   const increment = x=>x+1;
//   const double = x=>x*2;
//   const value = 9;

//   const mIncrement = Maybe.of(increment);
//   const mDouble = Maybe.of(double);
//   const mValue = Maybe.of(value);

//   const left = Maybe.of(compose).ap(mIncrement).ap(mDouble).ap(mValue);
//   const right = mIncrement.ap(mDouble.ap(mValue));

//   t.same(left, right, 'function can be lifted to the right or the left, should not matter');
//   t.end();
// });




//Nothing
test('Identity', function (t) {

  const I = x=>x;
  const mValue = Nothing;
  const applicative = Nothing;

  const left = applicative.ap(mValue);
  const right = mValue;

  t.same(left, right, 'Nothing applied to Nothing is Nothing');
  t.end();
});