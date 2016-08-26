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


/*
https://github.com/rpominov/static-land/blob/master/docs/spec.md#traversable
Laws

Naturality: f(T.sequence(A, u)) ≡ T.sequence(B, T.map(f)) for any f such that B.map(g, f(a)) ≡ f(A.map(g, a))
Identity: T.sequence(F, T.map(F.of, u)) ≡ F.of(u) for any Applicative F
Composition: T.sequence(ComposeAB, u) ≡ A.map(v => T.sequence(B, v), T.sequence(A, u)) for ComposeAB defined bellow and for any Applicatives A and B
const ComposeAB = {

  of(x) {
    return A.of(B.of(x))
  },

  ap(a1, a2) {
    return A.ap(A.map(b1 => b2 => B.ap(b1, b2), a1), a2)
  },

  map(f, a) {
    return A.map(b => B.map(f, b), a)
  },

}
Can be derived

Foldable's reduce:

F.reduce = (f, acc, u) => {
  const of = () => acc
  const map = (_, x) => x
  const ap = f
  return F.sequence({of, map, ap}, u)
}
*/