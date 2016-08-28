const compose  = (fn, ...rest) =>
  rest.length === 0 ?
    (fn||(x=>x)) :
    (...args) => fn(compose(...rest)(...args));
const curry = (f, ...args) => (f.length <= args.length) ? f(...args) : (...more) => curry(f, ...args, ...more);

const I = x=>x;
const K = x=>y=>x;


const ap = curry((A,A2) => A.ap(A2));
const map = curry((f,F) => F.map(x=>f(x)));//guard against Array.map
const reduce = curry((f,acc,F) => F.reduce(f,acc));
const chain = curry((f, M) => M.chain(f));
const liftA2 = curry((f, A1, A2) => A1.map(f).ap(A2));
const liftA3 = curry((f, A1, A2, A3) => A1.map(f).ap(A2).ap(A3));

const foldMap = curry(function(f, fldable) {
  return fldable.reduce(function(acc, x) {
    const r = f(x);
    acc = acc || r.empty();
    return acc.concat(r);
  }, null);
});

const fold = foldMap(I);

//Kleisli composition
const composeK = (...fns) => compose( ...([I].concat(map(chain, fns))) );


  //specialized reducer, but why is it internalized?
  const perform = point => (mr, mx) => mr.chain(xs => mx.chain( x => { 
      xs.push(x); 
      return point(xs);
    })
  );

//array.sequence, alternate
const sequence = curry((point, ms) => {


  return typeof ms.sequence === 'function' ?
    ms.sequence(point) :
    ms.reduce(perform(point), point([]));

});




module.exports = {
  I,
  K,
  compose,
  composeK,
  curry,
  reduce,
  ap,
  map,
  chain,
  liftA2,
  liftA3,
  sequence
};