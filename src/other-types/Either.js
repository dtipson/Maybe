const {curry, K, I}  = require('../../src/other-types/pointfree.js');

function Either(left, right){
  return right === null ? new Right(right) : new Left(left);
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

Either.prototype.fold = Either.prototype.reduce = function(f, g) {
  return this.cata({
    Left: f,
    Right: g
  });
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

Either.of = x => new Right(x);
Either.either = (leftFn, rightFn, e) => {
  if(e instanceof Left){
    return leftFn(e.value);
  }
  else if(e instanceof Right){
    return rightFn(e.value);
  }else{
    throw new TypeError('invalid type given to Either.either');
  }
} 


module.exports = {
  Either,
  Left,
  Right
};