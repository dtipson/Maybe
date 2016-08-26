const {curry, K, I}  = require('../../src/other-types/pointfree.js');

function Validation(failure, success){
  return success === null ? new Success(right) : new Failure(left);
}

const Failure = function(x){
  if (!(this instanceof Failure)) {
    return new Failure(x);
  }
  this.e = x;//storing the value in the instance
};

Failure.prototype = Object.create(Validation.prototype);

const Success = function(x){
  if (!(this instanceof Success)) {
    return new Success(x);
  }
  this.s = x;//storing the value in the instance
};

Success.prototype = Object.create(Validation.prototype);

//let's use the cata interface for most of the others
Failure.prototype.cata = function({Failure}){ return Failure(this.e) };
Success.prototype.cata = function({Success}){ return Success(this.s) };

Validation.prototype.fold = Validation.prototype.reduce = function(f, g) {
  return this.cata({
    Failure: f,
    Success: g
  });
};

Validation.prototype.map = function(f) {
  return this.cata({
    Failure: e => this,
    Success: e => Success(f(e))
  });
};


Failure.prototype.ap = function(b) {
  return b.cata({
    Failure: e => Failure(this.e.concat(e)),
    Success: s => this
  });
}

Success.prototype.ap = function(b) {
  return b.cata({
    Failure: e => b,
    Success: s => b.map(this.s)
  });
}

Validation.prototype.getOrElse = function(a) {
  return this.cata({
    Failure: e => a,
    Success: _ => this.s
  });
}

Failure.prototype.sequence = function(of) {
  return this.e.map(Failure);
}

Success.prototype.sequence = function(of) {
  return this.s.map(Failure);
}

Validation.prototype.leftMap = function(f) {
  return this.cata({
    Failure: e => Failure(f(e)),
    Success: _ => this
  });
}


Object.assign(Validation.prototype,{
  of: x => new Success(x),
  fromNullable: a => a != null ? new Success(a) : new Failure(a),
  //toEither: ,
  //toMaybe: ,
  fromEither: a => a.fold(Failure, Success),
  fromMaybe: a => a.fold(Failure('No value'), Success),
  toPromise: function(){
    return this.cata({
      Failure: e => Promise.reject(e),
      Success: s => Promise.of(s)
    })
  }
});

Validation.of = Validation.prototype.of;
Validation.fromNullable = Validation.prototype.fromNullable;
Validation.fromMaybe = Validation.prototype.fromMaybe;
Validation.fromEither = Validation.prototype.fromEither;

//not quite working
const aggregateValidations = (...testList) => testValue => 
  testList.traverse(test=>test(testValue), Validation.of);

module.exports = {
  Validation,
  Failure,
  Success,
  aggregateValidations
};