//monad for specifying the value transformation last maybe?  the value is a "resuming" function
//https://gist.github.com/tel/9a34caf0b6e38cba6772
//http://www.haskellforall.com/2012/12/the-continuation-monad.html for when you want to write a computation that specifies some critical operation later/externally?
/*
Whoa:
Our strategy works well if we have exactly one hole in our function, but what if we have two holes in our function, each of which takes a different argument?
Fortunately, there is a clean and general solution. Just define a data type that wraps both possible arguments in a sum type, and just define a single continuation that accepts this sum type:
//The continuation monad teaches us that we can always condense a sprawling API filled with callbacks into a single callback that takes a single argument.
*/

function Continuation(contHandler) {
  if (!(this instanceof Continuation)) {
    return new Continuation(contHandler);
  }
  this.contHandler = contHandler;
};

Continuation.of = function(value) {
  return new Continuation(cont => cont(value));
};

Continuation.prototype.run = function(resume) {
  return this.contHandler(resume);
};

Continuation.prototype.escape = function() {
  return this.run(x=>x);
};

Continuation.prototype.doNothing = function () {
  return new Continuation(resume => this.run(value => resume(value)) );
};

Continuation.prototype.doNothing = function () {
  return new Continuation(resume => this.run(resume) );
};

Continuation.prototype.chain = function (transform) {
  return new Continuation(resume => this.run(value => transform(value).run(resume)) );
};

Continuation.prototype.map = function (fn) {
  return this.chain(v => Continuation.of(fn(v)) );
};

Continuation.prototype.ap = function(app2) {
  return this.chain(fn => app2.chain(app2value => Continuation.of(fn(app2value)) ) );
};

module.exports = Continuation;