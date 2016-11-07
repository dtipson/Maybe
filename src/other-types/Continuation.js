//lots of similarities here to Task and Reader
//fork and handler are very similar: computation doesn't run until fork is called
//https://gist.github.com/tel/9a34caf0b6e38cba6772
function Continuation(fork) {
  if (!(this instanceof Continuation)) {
    return new Continuation(fork);
  }
  this.fork = fork;
};

Continuation.of = function(value) {
  return new Continuation(resume => resume(value));
};

Continuation.prototype.chain = function(fn) {
  return new Continuation(resume => this.fork(value => fn(value).fork(resume)) );
};

// Continuation.prototype.map = function (fn) {
//   return new Continuation(resume => this.fork(b => resume(fn(b)) ) );
// };
Continuation.prototype.map = function (fn) {
  return this.chain(v => Continuation.of(fn(v)) );
};

Continuation.prototype.ap = function(app2) {
  return this.chain(fn => app2.chain(app2value => Continuation.of(fn(app2value)) ) );
};

Continuation.ask = Continuation(x=>x);

Continuation.fill = value => Continuation.ask.map(resume => resume(value)).fork();

Continuation.prototype.fork = function(resume) {
  return this.fork(resume);
};

Continuation.prototype.run = Continuation.prototype.fork;

Continuation.prototype.escape = function() {
  return this.fork(x=>x);
};

Continuation.prototype.doNothing = function () {
  return new Continuation(resume => this.fork(value => resume(value)) );
};
//or?
Continuation.prototype.doNothing = function () {
  return new Continuation(resume => this.fork(resume) );
};





const Cont = Continuation;//alias

module.exports = Continuation;


//monad for specifying the value transformation last maybe?  the value is a "resuming" function
//https://gist.github.com/tel/9a34caf0b6e38cba6772
//http://www.haskellforall.com/2012/12/the-continuation-monad.html for when you want to write a computation that specifies some critical operation later/externally?
/*
Whoa:
Our strategy works well if we have exactly one hole in our function, but what if we have two holes in our function, each of which takes a different argument?
Fortunately, there is a clean and general solution. Just define a data type that wraps both possible arguments in a sum type, and just define a single continuation that accepts this sum type:
//The continuation monad teaches us that we can always condense a sprawling API filled with callbacks into a single callback that takes a single argument.
*/

/*
function unit(a) {
    return function(k) {
        return k(a);
    };
}

function bind(ma, f) {
    return function(k) {
        return ma(function(a) {
            return f(a)(k);
        });
    };
}

function doCont() {
    var args = Array.prototype.slice.apply(arguments);
    return function(k) {
        var f = args.shift();
        while (args.length > 0) {
            f = bind(f, args.shift());
        }
        return f(k);
    };
}

function call_cc(f) {
    return function(a) {
        return function(k) { return f(a, k); };
    };
}

function lift(f) {
    return call_cc(function(a, k) { return k(f(a)); });
}

function addEachOf() {
    var args = arguments;
    return call_cc(function(a, k) {
        var i;
        for (i=0; i<args.length; i++) {
            k(a + args[i]);
        }
    });
}

function alertMe(message) { alert(message); }

doCont(
    unit("goodbye cruel "),
    addEachOf("world", "fate", "mistress"),
    lift(function(a) { return a.toUpperCase(); })
)(alertMe);

*/