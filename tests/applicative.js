//const test = require('tape');
const test = require('tap').test;//more verbose


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('Identity', function (t) {

  const I = x=>x;
  const mValue = Just(9);
  const applicative = Maybe.of(I)

  const left = applicative.ap(mValue);
  const right = mValue;

  t.same(left, right, 'applying a [value] to [Identity] returns the same [value]');
  t.end();
});


test('Homomorphism', function (t) {

  const testFunc = x=>x+1;
  const testValue = 5;

  const left = Maybe.of(testFunc).ap(Maybe.of(testValue));
  const right = Maybe.of(testFunc(testValue));

  t.same(left, right, 'in-container application operations == same result as doing application operations then putting them into a container');
  t.end();
});


test('Interchange', function (t) {

  const testFunc = x=>x+1;
  const applicative = Just(testFunc)
  const testValue = 5;

  const left = applicative.ap(Just(testValue));
  const right = Just(function(f){return f(testValue)}).ap(applicative)

  t.same(left, right, 'function can be "lifted" to the right or the left of an operation, that should not matter');
  t.end();
});

// https://drboolean.gitbooks.io/mostly-adequate-guide/content/ch10.html#composition
//not defined in FL and I can't actually get it to work, compose returns the first function applied

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