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
    Failure: e => this.e.concat(e),
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

const aggregate2 = subject => test1 => test2 => 
  Success(a => b => subject).ap(test1(subject)).ap(test2(subject));


function curryN(n, f){
  return function _curryN(as) { return function() {
    var args = as.concat([].slice.call(arguments))
    return args.length < n?  _curryN(args)
    :      /* otherwise */   f.apply(null, args)
  }}([])
}


/*

from monet.js


var person = function (forename, surname, address) {
    return forename + " " + surname + " lives at " + address
}.curry();


var validateAddress = Validation.success('Dulwich, London')
var validateSurname = Validation.success('Baker')
var validateForename = Validation.success('Tom')

var personString = validateAddress.ap(validateSurname
  .ap(validateForename.map(person))).success()

// result: "Tom Baker lives at Dulwich, London"

var result = Validation.fail(["no address"])
  .ap(Validation.fail(["no surname"])
  .ap(validateForename.map(person)))
// result: Validation(["no address", "no surname"])

*/
/*
const aggregate = testList => 
  testValue => 
  testList.reduce((acc,x)=>acc.ap(x(testValue)), Success());//create function curried with exact # of args, ultimately returning testValue
*/

//not quite working
const aggregate = (...testList) => 
  testValue => 
  testList.reduce((acc,x)=>acc.ap(x(testValue)), Success(curryN(testList.length, x=>testValue)) );


module.exports = {
  Validation,
  Failure,
  Success,
  aggregate2,
  aggregate
};