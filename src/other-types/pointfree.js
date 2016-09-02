const compose  = (fn, ...rest) =>
  rest.length === 0 ?
    (fn||(x=>x)) :
    (...args) => fn(compose(...rest)(...args));
const curry = (f, ...args) => (f.length <= args.length) ? f(...args) : (...more) => curry(f, ...args, ...more);

const I = x => x;
const K = x => y => x;
const S = b => f => x => b(x,f(x));

//String -> Object -> Arguments -> ?
const invoke = methodname => obj => (...args) => obj[methodname](...args);

const ap = curry((A,A2) => A.ap(A2));
const map = curry((f,F) => F.map(x=>f(x)));//guard against Array.map
const reduce = curry((f,acc,F) => F.reduce(f,acc));
const chain = curry((f, M) => M.chain(f));
const liftA2 = curry((f, A1, A2) => A1.map(f).ap(A2));
const liftA3 = curry((f, A1, A2, A3) => A1.map(f).ap(A2).ap(A3));

const concat = curry( (x, y) => x.concat(y));


const head = xs => xs[0];
const tail = xs => xs.slice(1, Infinity);
const init = xs => xs.slice(0,-1);
const last = xs => xs.slice(-1)[0];
const prop = namespace => obj => obj[namespace];

const mconcat = (xs, empty) => xs.length ? xs.reduce(concat) : empty();
const bimap = curry((f,g,B)=> B.bimap(f,g)); 

const foldMap = curry(function(f, fldable) {
  return fldable.reduce(function(acc, x) {
    const r = f(x);
    acc = acc || r.empty();
    return acc.concat(r);
  }, null);
});

const fold = foldMap(I);

//from http://robotlolita.me/2013/12/08/a-monad-in-practicality-first-class-failures.html
function curryN(n, f){
  return function _curryN(as) { return function() {
    var args = as.concat([].slice.call(arguments))
    return args.length < n?  _curryN(args)
    :      /* otherwise */   f.apply(null, args)
  }}([])
}

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
  S,
  compose,
  composeK,
  curry,
  curryN,
  reduce,
  ap,
  map,
  chain,
  mconcat,
  concat,
  liftA2,
  liftA3,
  sequence,
  invoke,
  head,
  tail,
  init,
  last,
  prop,
  bimap
};