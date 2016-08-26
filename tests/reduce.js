//const test = require('tape');
const test = require('tap').test;//more verbose

//F.reduce ≡ (f, x, u) => F.reduce((acc, y) => acc.concat([y]), [], u).reduce(f, x)


const {Maybe,Just,Nothing} = require('../src/Maybe.js');

test('reduce', function (t) {

  const takeValue = Just(5).reduce( x => x, Nothing);
  const toArray = Just([5]).reduce( x => x.concat(x), [8]);
  const toNumber = Just(5).reduce( x => x, 8);
  const reduceNothing = Nothing.reduce( x => x, 5);

  t.equals(takeValue, 5, 'returning the contained item returns the inner value');
  t.same(toArray, [5,5], 'transform Just to an array');
  t.equals(toNumber, 5, 'transform Just to an Number');
  t.equals(reduceNothing, 5, 'reducing on a Nothing = accumulator is returned unaltered');
  t.end();
});

/*

const A = {
  of(x) {
    return [x]
  },
  map(f, arr) {
    return arr.map(f)
  },
  sequence(T, arr) {
    return arr.reduce((acc, input) => {
      return T.ap(T.map(a => i => a.concat([i]), acc), input)
    }, T.of([]))
  }
}

A.reduce = (f, acc, u) => {
  const of = () => acc
  const map = (_, x) => x
  const ap = f
  return A.sequence({of, map, ap}, u)
}

A.reduce((a, b) => a + b, '', ['1', '2', '3']);//->'123'
*/