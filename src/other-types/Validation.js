const {curry, K, I, mconcat, ap}  = require('../../src/other-types/pointfree.js');

function Validation(){
  throw new Error("Not called directly");
}

const Failure = function(x){
  if (!(this instanceof Failure)) {
    return new Failure(x);
  }
  if(x==null || !x.concat){
    throw new Error("Failure values must have a concat method (e.g. Strings, Arrays, etc.)")
  }
  this.e = x;//storing the value
};

Failure.prototype = Object.create(Validation.prototype);

const Success = function(x){
  if (!(this instanceof Success)) {
    return new Success(x);
  }
  this.s = x;//storing the value
};

Success.prototype = Object.create(Validation.prototype);

//let's create a cata interface with which we can define many of the others
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

Success.prototype.concat = function(b) {
  return b.cata({
    Failure: e => b,
    Success: s => b.map(bs=>this.s.concat(bs))
  });
}

Failure.prototype.concat = function(b) {
  return b.cata({
    Failure: e => Failure(this.e.concat(e)),
    Success: s => this
  });
}

//https://github.com/fantasyland/fantasy-validations/blob/master/src/validation.js#L44-L54
// Validation.prototype.concat = function(b) {
//     return this.fold(
//         f => {
//             return b.bimap(
//                 g => f.concat(g),
//                 identity
//             );
//         },
//         s => b.map(d => s.concat(d))
//     );
// };

Validation.prototype.getOrElse = function(a) {
  return this.cata({
    Failure: e => a,
    Success: _ => this.s
  });
}


//probably not right
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

//nope: need the value to return a success...
const mconcatv = x => mconcat(x, Validation.of(x));


//not quite working, is traverse wrong?
const aggregateValidationsFailed = (...testList) => testValue => testList.traverse(test=>test(testValue), Validation.of);

const aggregateValidations = (arrayOfTests) => arrayOfTests.length ?
  compose(mconcat, ap(arrayOfTests), Array.of) ://concat
  x => Success(x);//empty case is usually a mistake, but it returns the original value at least

//run values over matching lists, then concat all the lists to get the final validation of all values, success/fail list

module.exports = {
  Validation,
  Failure,
  Success,
  aggregateValidations
};