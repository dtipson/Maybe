const {curry, compose, K, I}  = require('../../src/other-types/pointfree.js');

function Either(...args){
  switch (args.length) {
    case 0:
      throw new TypeError('no left value: consider using Maybe');
    case 1:
      return function(right) {
        return right == null ? Left(args[0]) : Right(right);
      };
    default:
      return args[1] == null ? Left(args[0]) : Right(args[1]);
  }
}

const Left = function(x){
  if (!(this instanceof Left)) {
    return new Left(x);
  }
  this.l = x;//storing the value in the instance
};

Left.prototype = Object.create(Either.prototype);

const Right = function(x){
  if (!(this instanceof Right)) {
    return new Right(x);
  }
  this.r = x;//storing the value in the instance
};

Right.prototype = Object.create(Either.prototype);

//let's use the cata interface for most of the others
Left.prototype.cata = function({Left}){ return Left(this.l) };
Right.prototype.cata = function({Right}){ return Right(this.r) };

Right.prototype.concat = function(e) {
  return e.cata({
    Left: l => e,
    Right: r => Right(this.r.concat(r))
  });
};

Left.prototype.concat = function(e) {
  return e.cata({
    Left: l => Left(this.l.concat(l)),
    Right: r => this
  });
};

Either.prototype.fold = function(f, g) {
  return this.cata({
    Left: f,
    Right: g
  });
};

Either.prototype.toString = function() {
  return this.cata({
    Left: l => `Left[${l}]`,
    Right: r => `Right[${r}]`
  });
};


Either.prototype.swap = function() {
    return this.fold(
        (l) => Right(l),
        (r) => Left(r)
    );
};


Either.prototype.chain = function(f) {
  return this.fold(K(this), f);
};

Either.prototype.map = function(f) {
  return this.chain( a => Either.of(f(a)) );
};

Either.prototype.ap = function(A) {
    return this.chain(f => A.map(f));
};


///???
Either.prototype.sequence = function(p) {
    return this.traverse(I, p);
};
Either.prototype.traverse = function(f, p) {
    return this.cata({
        Left: l => p(Left(l)),//is this right???
        Right: r => f(r).map(Right)
    });
};

Either.prototype.bimap = function(f, g) {
  return this.fold(
    l => Left(f(l)), 
    r => Right(g(r))
  );
};

Either.try = f => (...args) => {
  try{
    return Right(f(...args));
  }
  catch(e){
    return Left(e);
  }
};


Either.fromNullable = x => (x != null) ? Right(x) : Left();


Either.fromPredicate = curry(
  (fn, x) => fn(x) ? Right(x) : Left(x)
);
Either.of = x => new Right(x);
Either.either = curry((leftFn, rightFn, E) => {
  if(!(E instanceof Either)){
    throw new TypeError('invalid type given to Either.either');
  }
  return E.cata({
    Right: r => rightFn(r),
    Left: l => leftFn(l)
  })
});


const isArrayString = x=>/\[\d\]/.test(x);

const objOrArray = pathComponent => 
  Either.fromPredicate(isArrayString, pathComponent)
    .fold(I,x=>x.replace(/\[\]/g))

//users.0.name
const getPath = (paths, obj) => 
  paths.reduce(
    (eobj, pathC) => eobj.chain(o=>Either.fromNullable(o[pathC])), 
    Either.of(obj)
  ).fold(x=>undefined, I)

const splitPath = arg => 
  Either.fromPredicate(x=>typeof x === "string", arg)
    .fold(I, x=>x.split('.'));


Either.get = curry(
  (pathOrPathString, obj) => getPath(splitPath(pathOrPathString), obj)
)

module.exports = {
  Either,
  Left,
  Right
};