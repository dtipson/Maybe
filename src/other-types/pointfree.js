const compose  = (fn, ...rest) =>
  rest.length === 0 ?
    (fn||(x=>x)) :
    (...args) => fn(compose(...rest)(...args));

const curry = (f, ...args) => (f.length <= args.length) ? f(...args) : (...more) => curry(f, ...args, ...more);

const I = x => x;//identity
const K = curry((x,y) => x);//constant
const W = curry((x,f) => f(x)(x));//duplication
const S = curry((f, g, x) => f(x)(g(x)));//substitution
const S2 = f => g => x => f(x, g(x));//substitution, but for non-curried

const binaryLeft = curry((x, l, _) => l(x));
const binaryRight = curry((x, _, r) => r(x));


//String -> Object -> Arguments -> ?
const invoke = curry(
  (methodname, obj) => (...args) => obj[methodname](...args)
);
const andCall = curry(
  (methodname, obj) => obj[methodname](...args)
);


const ap = curry((A, A2) => A.ap(A2));
const map = curry((f, F) => F.map(x=>f(x)));//guard against Array.map
const reduce = curry((f, acc, F) => F.reduce(f,acc));
const chain = curry((f, M) => M.chain(f));


const lift = map;
const liftA2 = curry((f, A1, A2) => A1.map(f).ap(A2));//
const liftA3 = curry((f, A1, A2, A3) => A1.map(f).ap(A2).ap(A3));
//look ma, no map needed!
//const liftA22 = curry((f, A1, A2) => A1.constructor.of(f).ap(A1).ap(A2));

const dimap = curry( (lmap, rmap, fn) => compose(rmap, fn, lmap) );
//mutates just the ouput of a function to be named later
const lmap = contramap = f => dimap(f, I);
//mutates the input of a function to be named later    
const rmap = dimap(x=>x);

const iso = dimap;

iso.mapISO = iso(x=>[...x], xs=>new Map(xs));


//based off of https://github.com/DrBoolean/immutable-ext
Map.prototype.concat = function(otherMap){
  const newMap = [];
  for (let [key, value] of this) {
    let otherValue = otherMap.get(key); 
    if(!value.concat || !otherValue.concat){
      throw new Error('values must be semigroups');
    }
    newMap.push([key,value.concat(otherValue)])
  }
  return new Map(newMap);
}

Map.prototype.annotate = function(typeMap){
  const newMap = [];
  for (let [key, value] of this) {
    let typeConstructor = typeMap.get(key); 
    newMap.push([key,typeConstructor(value)])
  }
  return new Map(newMap);
}

Map.prototype.concatTypes = function(otherMap, typeMap){
  const newMap = [];
  for (let [key, value] of this) {
    const typeConstructor = typeMap.get(key); 
    const otherValue = typeConstructor(otherMap.get(key)); 
    newMap.push([key,typeConstructor(value).concat(otherValue)])
  }
  return new Map(newMap);
}




const head = xs => xs.head || xs[0];
const init = xs => xs.slice(0,-1);
const tail = xs => xs.tail || xs.slice(1, Infinity);
const last = xs => xs.last ? xs.last() : xs.slice(-1)[0];
const prop = namespace => obj => obj[namespace];


//these two include polyfills for arrays
const extend = fn => W => {
  return typeof W.extend ==="function" ?
    W.extend(fn) :
    W.map((_,i,arr)=>fn(arr.slice(i)))
};
const extract = W => {
  return typeof W.extract ==="function" ? 
    W.extract() :
    head(W);
};

const concat = curry( (x, y) => x.concat(y));
//inferring empty is not a great idea here...
const mconcat = (xs, empty) => xs.length||xs.size() ? xs.reduce(concat, empty) : empty ? empty() : xs.empty();
const bimap = curry((f,g,B)=> B.bimap(f,g)); 

// const foldMap = curry(function(f, fldable) {
//   return fldable.reduce(function(acc, x) {
//     const r = f(x);
//     acc = acc || r.empty();
//     return acc.concat(r);
//   }, null);
// });

//const fold = foldMap(I);


//have to specify the monoid upfront here
// foldMap : (Monoid m, Foldable f) => m -> (a -> m) -> f a -> m
const foldMap = curry(
  (Monoid, f, Foldable) => Foldable.reduce((acc, x) => acc.concat(f(x)), Monoid.empty())
);

const foldAs = curry(
  (Monoid, Foldable) => foldMap(Monoid, Monoid, Foldable).x
); 

var fold3 = curry(
  (lfn, rfn, foldable) => foldable.fold(lfn,rfn)
);

// fold : (Monoid m, Foldable f) => m -> f m -> m
const fold = curry(
  (Monoid, Foldable) => foldMap(Monoid, I, Foldable)
);

//if the fn produces Monoids from the values inside foldables with an .empty instance on constructor and instances then all we need is the fn and the foldable...
var foldMap2 = curry(function(f, fldable) {
  return fldable.reduce(function(acc, x) {
    var r = f(x);
    acc = acc || r.empty();
    return acc.concat(r);
  }, null);
});

// fold : (Binary Reducing fn, Target Type g, foldable)
var fold2 = curry(
  (rfn, g, fldable) => fldable.fold(rfn, g)
);



//from http://robotlolita.me/2013/12/08/a-monad-in-practicality-first-class-failures.html
function curryN(n, f){
  return function _curryN(as) { return function() {
    var args = as.concat([].slice.call(arguments))
    return args.length < n?  _curryN(args)
    :      /* otherwise */   f.apply(null, args)
  }}([])
}

//Kleisli composition
const kleisli_comp = (f, g) => x => f(x).chain(g)
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

const traverse = curry( (f, point, Traversable) => Traversable.map(f).sequence(point) );

const runIO = IO => IO.runIO();

//reducing patterns

const any = (acc, x) => x || acc;//empty is false
const all = (acc, x) => x && acc;//empty is true

const converge = curry((f, g, h) => (...args) => f(g(...args), h(...args)));

const apply  = f => arr => f(...arr)
const unapply = f => (...args) => f(args);





module.exports = {
  I,
  K,
  S,
  W,
  apply,
  unapply,
  compose,
  composeK,
  kleisli_comp,
  converge,
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
  traverse,
  invoke,
  head,
  tail,
  init,
  last,
  prop,
  extend,
  extract,
  bimap,
  fold,
  foldAs,
  foldMap,
  lmap,
  rmap,
  iso,
  dimap,
  any,
  all,
  runIO,
  binaryLeft,
  binaryRight
};