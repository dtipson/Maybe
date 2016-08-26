(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./src/other-types/Array-helpers.js');
require('./src/other-types/Promise-helpers.js');
const Const = require('./src/other-types/Const.js');
const Continuation = require('./src/other-types/Continuation.js');
const Identity = require('./src/other-types/Identity.js');
const IO = require('./src/other-types/IO.js');
const Reader = require('./src/other-types/Reader.js');
const State = require('./src/other-types/State.js');
const Tuple = require('./src/other-types/Tuple.js');
const Writer = require('./src/other-types/Writer.js');

Object.assign(
  window, 
  require('./src/Maybe.js'),
  require('./src/other-types/Either.js'),
  {Const, Continuation, Cont:Continuation, Identity, IO, Reader, Tuple, State, Writer},
  require('./src/other-types/pointfree.js'),
  require('./src/other-types/Validation.js'),
  require('./src/other-types/utility.js')
);
},{"./src/Maybe.js":2,"./src/other-types/Array-helpers.js":3,"./src/other-types/Const.js":4,"./src/other-types/Continuation.js":5,"./src/other-types/Either.js":6,"./src/other-types/IO.js":7,"./src/other-types/Identity.js":8,"./src/other-types/Promise-helpers.js":9,"./src/other-types/Reader.js":10,"./src/other-types/State.js":11,"./src/other-types/Tuple.js":12,"./src/other-types/Validation.js":13,"./src/other-types/Writer.js":14,"./src/other-types/pointfree.js":15,"./src/other-types/utility.js":16}],2:[function(require,module,exports){
const {curry}  = require('../src/other-types/pointfree.js');

function Maybe(){//create a prototype for Nothing/Just to inherit from
    throw new TypeError('Maybe is not called directly');
}

//We only ever need one "Nothing" so we'll define the type, create the one instance, and return it. We could have just created an object with 
//all these methods on it, but then it wouldn't log as nicely/clearly
const Nothing = (function(){
  const Nothing = function(){};
  Nothing.prototype = Object.create(Maybe.prototype);
  Nothing.prototype.ap = Nothing.prototype.chain = Nothing.prototype.join = Nothing.prototype.flatten = Nothing.prototype.map = Nothing.prototype.filter = function(){ return this; };
  Nothing.prototype.sequence = function(of){ return of(this); };//flips Nothing insde a type, i.e.: Type[Nothing]
  Nothing.prototype.traverse = function(fn, of){ return of(this); };//same as above, just ignores the map fn
  Nothing.prototype.reduce = Nothing.prototype.fold = (a, b) => a,//binary function is ignored, the accumulator returned
  Nothing.prototype.getOrElse = Nothing.prototype.orElse = Nothing.prototype.concat = x => x;//just returns the provided value
  Nothing.prototype.cata = ({Nothing}) => Nothing();  //not the Nothing type constructor here, btw, a prop named "Nothing" defining a nullary function!
  Nothing.prototype.equals = function(y){return y==this;};//setoid
  Nothing.prototype.toString = _ => 'Nothing';
  Nothing.prototype.toBoolean = _ => false;//reduce a Nothing to false
  //Nothing.prototype[Symbol.toPrimitive] = function(hint){ return hint=='string' ? "" : 0; };//define some behavior for coercion: empty string for string coercion, 0 for number coercion
  Nothing.prototype.toJSON = _ => '{"type":"Maybe.Nothing"}';

  return new Nothing();
})();//result will fail an instanceof Nothing check, because "Nothing" is not the Nothing constructor in the outer scope

//now we'll create a Just type with all the same interfaces we defined on Nothing

//here, we eliminate the need to call it with new
const Just = function(x){
  if (!(this instanceof Just)) {
    return new Just(x);
  }
  this.value = x;//storing the value in the instance
};
Just.prototype = Object.create(Maybe.prototype);
Just.prototype.getOrElse = Just.prototype.flatten = Just.prototype.join = function(){ return this.value; };//transform the inner value
Just.prototype.map = function(f){ return new Just(f(this.value)); };//transform the inner value
Just.prototype.ap = function(b){ return b.map(this.value); };//if the inner value is a function, apply a value to it
Just.prototype.chain = function(f){ return f(this.value); };//transform the inner value, assuming the function returns Just/Nothing
Just.prototype.sequence = function(of){ return this.value.map(Just); };//flip an inner type with the outer Just
Just.prototype.traverse = function(fn, of){ return this.map(fn).sequence(of); };//transform the inner value (resulting in an inner type) then flip that type outside
Just.prototype.toString = function(){ return `Just[${this.value}]`; };
Just.prototype.reduce = Just.prototype.fold = function(a, b) { return b(this.value); };//binary function is run, accumulator ignored
Just.prototype.filter = function(fn){ return this.chain(x=> fn(x)? this : Nothing ); };//test the inner value with a function

//assuming that the inner value has a concat method, concat it with another Just. Falls back to + for strings and numbers
Just.prototype.concat = function(b){
  return b.value && !Maybe.isNull(b.value) ? Just(this.value.concat ? this.value.concat(b.value) : this.value + b.value) : this 
};
Just.prototype.equals = function(y){ return y.value === this.value; };//strictly compare the inner values
//Just.prototype[Symbol.toPrimitive] = Just.prototype.getOrElse = function(){ return this.value; };//extract the inner value when forcibly coerced to deliver a value
Just.prototype.orElse = function(){ return this; }//does nothing in the Just case
Just.prototype.cata = function({Just}){ return Just(this.value) };//calls the function defined in prop "Just" with the inner value
Just.prototype.toBoolean = _ => true;//reduce a Just to true. Useful in filters
Just.prototype.toJSON = function(){ return `{"type":"Maybe.Just","value":${JSON.stringify(this.value)}}`; };

//we're not strictly defining Just and Nothing as subtypes of Maybe here, but we DO want to have a Maybe interface for more abstract usages
Object.assign(Maybe,{
  of: x => new Just(x),//pointed interface to create the type (Just(9)/Maybe.of are synonymous )
  empty: _ => Nothing,//calling empty returns a Nothing
  isNull: x=> x===null || x===undefined,
  toBoolean: m => m!==Nothing,//reduce a passed in Just[any value]/Nothing value to true or false, useful for filters
  fromNullable: x=> Maybe.isNull(x) ? Nothing : Just(x),
  maybe: (nothingVal, justFn, M) => M.reduce(nothingVal, justFn)
});

const maybe = curry(Maybe.maybe);//pretty important pattern, yo

module.exports = {
  Maybe,
  Just,
  Nothing,
  maybe
};

/*


The maybe function might need some introduction. It takes 3 arguments, and as it should be with functional programming, all are important.  Argument one is the default case: the fallback.  Argument 2 is a function you want run on a value, if it can be.  The final argument is of the Maybe type: either a Just or a Nothing.

Here's what that gets us: the ability to resolve previously indeterminate possibilities:

maybe(5, x => x+1, Just(4));//-> 5
maybe(5, x => x+1, Nothing);//-> 5

What maybe does here is based on an operation .reduce: in fact, it's just a pointfree helper version of for Maybe[i.e. Just or Nothing].reduce:

const maybe = (nothingVal, justFn, M) => M.reduce(justFn, nothingVal);
//vs
Nothing.prototype.reduce = Nothing.prototype.fold = (f, x) => x,//binary function is ignored, the accumulator returned
Just.prototype.reduce = Just.prototype.fold = function(fn, acc) { return fn(this.value); };//binary function

Just(4).reduce( x=> x+1, 5);//-> 5
Nothing.reduce( x=> x+1, 5);//-> 5

The idea of "reducing" a container type that can hold, at most, a single item anyhow may seem a bit strange if Array.reduce is your only exposure to "reduce." But these are not just two different operations with the same name: .reduce (more often known as "fold" in the FP world) is as deeply lawful and generic an operation as the Monadic operations. 

Now, the whole point of this function is that you usually won't know, at runtime, whether the final argument is going to be Just containing a value or a Nothing. If you did know, then the above operations would be a bit silly: if you want a 5 for something, then just use a 5 already! 

But consider the little mini-program mentioned at the end of the "Getting Something from Nothing" article: a user enters an id, and if the id matches a record in a "database," then it returns a Just containing some information. Otherwise it returns a nothing.  We then used map to format the information and then again to cause a side-effect (an alert) that reported the information back to the user. In the Nothing case, nothing at all happened, which is great: no errors.  But what if we wanted the user to get something back no matter what?  

This is normally where we'd introduce Maybe's amped up cousin, the Either monad. That pattern would allow us to send special data about an error down through the chain of operations (skipping every operation that was mapped, but available to other specialized operations). 

But we can actually use the reduce interface on our Maybe type to achieve some of the same things. Here's a simple case:

getData(4).reduce(x=>x,'No Data Found, sorry');//-> either some data, or "No data found, sorry"

//pointfree
maybe('No Data Found, sorry',x=>x, getData(4));//-> same result

(note that the results here are no longer inside of the Maybe type: the ambiguity of that type is now resolved into a guaranteed result!)

Here, we didn't actually do anything to the Just side of the possible outcomes: we just passed it along using the identity function.  That's great, but let's say that the type of thing you get back from getData was a plain javascript object: we'd obviously want to convert that into a string so that by the end of our little program, the same type (a String) was returned either way:

Just({name:'Drew'}).reduce(JSON.stringify,'No data found, sorry');//-> '{"name":"Drew"}'
Nothing.reduce(JSON.stringify,'No data found, sorry');//-> "No data found, sorry"

Right? The whole point of using a Maybe type is to restore sane, unambiguous type-signatures to our programs so that they are easy to reason about and compose together. If we want the Nothing side of things to ultimately still have a side effect along the same path as the Just side of things, then at some point they _must_ to "fold" down into the same type of output!

That's already some really powerful stuff (at least I hope you think so!) but I didn't really appreciate just how powerful until Fluture author https://github.com/Avaq pointed it out: there's no requirement that the value for the "default case" (aka the accumulator) of maybe/reduce must be a bare, primitive value.

That is: this is functional programing we're talking about here.  What if instead of just reducing down to a single value, we were interested in reducing a functional operation with TWO steps down into one with ONE step.

Here's the base (and mostly uninteresting) example:

const add = x => y => x+y;
const identity = y => y;

const maybeSum = maybe(add, identity);//-> partially applied maybe, waiting for a Maybe value

maybeSum(Just(1));//-> unary function (+1)
maybeSum(Nothing);//-> unary function (identity)

The result of the maybe/reduce operation in this case isn't a value: it's a function. And what our maybe operation did was help us resolve which function to return: if we have a value, a partially applied addition function that will add it to the next value, vs identity, which will just return the next value.  The type signature of the final function is the same, even though it does different things.

It gets tricky to explain exactly what that means, and why it's so cool, without a more complex example/use-case, so hopefully I can boil this down to the essentials.

Imagine that we have some client-side data from user-input.  That data might match a database record that already exists, or it might belong to a record that _doesn't_ yet exist: we don't start off knowing which is which. Let's say for our purposes that email is the unique index, and email is part of the client-side data (perhaps a user is entering information into a form).
const W = f => x => f(x)(x);
//simulated database
const database = {
  "dtipson@gmail.com": {name:"Drew", email:"dtipson@gmail.com"}
}
//simulated database lookup, which returns a Maybe
const maybeGetUserViaEmail = ({email}) => database[email] ? Just(database[email]) : Nothing;



const createUser = data => Object.assign({retrieved: Date.now()}, data);
const updateUser = dbdata => data => Object.assign({retrieved: Date.now()}, dbdata, data);


//merges a db record OR creates it, and returns the merged record 
const getMergedData = W(data => maybeGetUserViaEmail(data).reduce(updateUser, createUser));





getMergedData({email:'dtipson@gmail.com'});//-> {email:'dtipson@gmail.com', name:'Drew'}
getMergedData({email:'edward209@gmail.com', name:'Ed'});//-> {email:'edward209@gmail.com', name:'Ed'}


...transducers...



Of course, if we knew that we always wanted a 5, we'd just have used a five, no Maybe type necessary.

original:
const create = data => ({data, iat: Date.now()});
const update = record => data => ({data: {...record.data, ...data}, iat: Date.now()});

const maybeRecord = findData();
const process = maybe(create, update, maybeRecord);

process(input);




const database = {
  0: {name:'Drew'}
};

const newRecord = data => {
  database[1] = data;
  return data;
};

const findData => id => database[id] ? Just(database[id]) : Nothing;

const create = data => newRecord(data);
const update = record => data => ({data: {name:data.name}, iat: Date.now()});

const maybeRecord = findData(4);
const process = maybe(create, update, maybeRecord);

process(4);
*/
},{"../src/other-types/pointfree.js":15}],3:[function(require,module,exports){
Array.empty = _ => [];
Array.prototype.flatten = function(){return [].concat(...this); };
//we need to guard the f against the extra args that native Array.map passes to avoid silly results
Array.prototype.chain = function(f){
  return this.map(x=>f(x)).flatten();
};
Array.prototype.ap = function(a) {
  return this.reduce( (acc,f) => acc.concat( a.map(f) ), []);//also works, & doesn't use chain
};
Array.prototype.sequence = function(point){
    return this.reduceRight(
      function(acc, x) {
        return acc.map(arr => p => [p].concat(arr) ).ap(x);
      },
      point([])
    );
};



Array.prototype.traverse = function(f, point){
    return this.map(f).sequence(point);
};
},{}],4:[function(require,module,exports){
function Const(value) {
  if (!(this instanceof Const)) {
    return new Const(value);
  }
  this.value = value;
}
Const.of = x => new Const(x);

Const.prototype.map = function() {
  return this;
};

module.exports = Const;

/*

  reduce is then 
  .prototype = function(f, acc) {
    const thisAcc = x => Const(acc);
    Const.prototype.ap = function(b) {
      return new Const(f(this.value, b.value));
    };
    return this.map(x => new Const(x)).sequence(thisAcc).value; 
  }

*/
},{}],5:[function(require,module,exports){
//lots of similarities here to Task, which is a sort of this married to an Either
//fork and handler are very similar: computation doesn't run until fork is calleds

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
},{}],6:[function(require,module,exports){
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
},{"../../src/other-types/pointfree.js":15}],7:[function(require,module,exports){
function IO(fn) {
  if (!(this instanceof IO)) {
    return new IO(fn);
  }
  this.runUnsafe = fn;//IO creates an extra control layer above a function
}


IO.prototype.of = x => IO(_=>x);//it can also take a value IO(K(x))
IO.of = IO.prototype.of;

IO.prototype.chain = function(f) {
  return IO(() => f(this.runUnsafe()).runUnsafe() );
};
//operations sequenced in next stack?
IO.prototype.fork = function(f) {
  return IO(() => window.setTimeout(()=>this.runUnsafe(),0) );
};

IO.prototype.ap = function(a) {
  return this.chain( f => a.map(f));
};

IO.prototype.map = function(f) {
  return this.chain( a => IO.of(f(a)) );
};

//?unproven/maybe not possible?
IO.prototype.sequence = function(of) {
  return of(this.map());
};


module.exports = IO;
},{}],8:[function(require,module,exports){
function Identity(v) {
  if (!(this instanceof Identity)) {
    return new Identity(v);
  }
  this.value = v;
}

Identity.prototype.of = x => new Identity(x);
Identity.of = Identity.prototype.of;

Identity.prototype.map = function(f) {
  return new Identity(f(this.value));
};
Identity.prototype.ap = function(app) {
  return app.map(this.value);
};
Identity.prototype.sequence = function(of){
  return this.value.map(Identity.of); 
};
Identity.prototype.chain = function(f) {
  return f(this.value);
};
Identity.prototype.get = function() {
  return this.value;
};
Identity.prototype.equals = function(that){
  return that instanceof Identity && that.value === this.value;
};


module.exports = Identity;
},{}],9:[function(require,module,exports){
Promise.prototype.of = Promise.resolve;
Promise.of = x => Promise.resolve(x);
Promise.prototype.map = Promise.prototype.chain = Promise.prototype.then;
Promise.prototype.bimap = Promise.prototype.then;
Promise.prototype.fold = Promise.prototype.then;//is it really? 
//Yes: Promise.reject(9).fold(x=>acc+1, x=>x+1)->P10 Promises hold only one value
//not sure if tasks turn reject into a resolve like this tho

//I think this might still be correct, maybe?
Promise.prototype.ap = function(p2){
  return Promise.all([this, p2]).then(([fn, x]) => fn(x));
}

//create a Promise that will never resolve
Promise.empty = function _empty() {
  return new Promise(function() {});
};

//delegates to how race works: the first resolving OR rejecting wins
Promise.prototype.concat = function(that){
 return Promise.race([this,that]);
};

//the first _resolving_ promise wins, otherwise the first rejecting
Promise.prototype.hopefulConcat = function(that){
  return Promise.race([this,that]).catch(
  e => {
    let resolved = {};
    return this.then(a=>{
      resolved = this;
      return a;
    },b=>{
      return that.then(c=>{
        resolved = that;
        return c;
      });
    }).then(x=> resolved.then ? resolved : Promise.reject(e), x=>Promise.reject(e));
  });
};

//just a reduce using concat2, takes the first to resolve, or first to reject once all have rejected
Promise.prototype.enterChallengers = function(arr){
  return arr.reduce((acc,x) => acc.concat2(x), this);
}


//???? just copied over from Task
Promise.prototype.orElse = function _orElse(f) {
  return new Promise(function(resolve, reject) {
    return this.then(null,function(a) {
      return f(a).then(resolve, reject);
    });
  });
};




},{}],10:[function(require,module,exports){
function Reader(run) {
  if (!(this instanceof Reader)) {
    return new Reader(run);
  }
  this.run = run;
}

Reader.prototype.chain = function(f) {
  return new Reader( r => f(this.run(r)).run(r) );
};

Reader.prototype.ap = function(a) {
  return this.chain( f => a.map(f) );
};

Reader.prototype.map = function(f) {
  return this.chain( a => Reader.of(f(a)) );
};

Reader.prototype.sequence = function(of){
  //return of(this);//WRONG!!! Reader.of([3,4]).sequence(Array.of) is wrong with this!
  return this.run().map(Reader.of);
}

Reader.prototype.of = function(a) {
  return new Reader( _ => a );
};
Reader.of = Reader.prototype.of;


Reader.ask = Reader(x=>x);//ask allows you to inject the/a runtime depedency into a computation without needing to specify ahead of time what it is

//silly helper
Reader.binary = fn => x => Reader.ask.map(y => fn(y, x));
Reader.exec = x => Reader.ask.map(fn => fn(x));

module.exports = Reader;
},{}],11:[function(require,module,exports){
const {curry}  = require('../../src/other-types/pointfree.js');

var Identity = require('./Identity');
var Tuple = require('./Tuple');
var {deriveAp, deriveMap} = require('./utility');


function T(M) {
  function StateT(run) {
    if (!(this instanceof StateT)) {
      return new StateT(run);
    }
    this._run = run;
  }
  StateT.prototype.run = function(s) {
    return this._run(s);
  };
  StateT.prototype.eval = function(s) {
    return Tuple.fst(this.run(s));
  };
  StateT.prototype.exec = function(s) {
    return Tuple.snd(this.run(s));
  };
  StateT.prototype.chain = function(f) {
    var state = this;
    return StateT(function(s) {
      return state._run(s).chain(function(t) {
        return f(Tuple.fst(t))._run(Tuple.snd(t));
      });
    });
  };
  StateT.of = StateT.prototype.of = function(a) {
    return StateT(function (s) {
      return M.of(Tuple(a, s));
    });
  };
  StateT.prototype.ap = deriveAp(StateT);
  StateT.prototype.map = deriveMap(StateT);
  StateT.tailRec = curry(function(stepFn, init) {
    return StateT(function(s) {
      return M.tailRec(function(t) {
        return stepFn(Tuple.fst(t))._run(Tuple.snd(t)).chain(function (t_) {
          return M.of(Tuple.fst(t_).bimap(
            function(a) { return Tuple(a, Tuple.snd(t_)); },
            function(b) { return Tuple(b, Tuple.snd(t_)); }
          ));
        });
      }, Tuple(init, s));
    });
  });
  StateT.lift = function(ma) {
    return StateT(function(s) {
      return ma.chain(function(a) {
        return M.of(Tuple(a, s));
      });
    });
  };
  StateT.get = StateT(function(s) {
    return M.of(Tuple(s, s));
  });
  StateT.gets = function(f) {
    return StateT(function(s) {
      return M.of(Tuple(f(s), s));
    });
  };
  StateT.put = function(s) {
    return StateT(function(_) {
      return M.of(Tuple(void _, s));
    });
  };
  StateT.modify = function(f) {
    return StateT(function(s) {
      return M.of(Tuple(void 0, f(s)));
    });
  };

  return StateT;
}

var State = T(Identity);
State.T = T;
State.prototype.run = function(s) {
  return this._run(s).value;
};

module.exports = State;
},{"../../src/other-types/pointfree.js":15,"./Identity":8,"./Tuple":12,"./utility":16}],12:[function(require,module,exports){
function Tuple(x, y) {
  if (!(this instanceof Tuple)) {
    return new Tuple(x,y);
  }
  this[0] = x;//log
  this[1] = y;//value
  this.length = 2;
}

Tuple.of = x => y => new Tuple(x, y);
Tuple.prototype.of = Tuple.of;

Tuple.prototype.map = function(f){
  return new Tuple( this[0], f(this[1]) );
}
Tuple.prototype.ap = function(wr){
  return Tuple( this[0].concat(wr[0]), this[1](wr[1]) );
}
Tuple.prototype.fst = function(){return this[0]};
Tuple.prototype.snd = function(){return this[1]};
Tuple.fst = tuple => tuple[0];
Tuple.snd = tuple => tuple[1];

Tuple.prototype.swap = function(){return Tuple(this[1],this[0])};


const Tupleize = Tuple.lift = (xval, yfn) => x => Tuple(xval, yfn(x));


//semigroup
Tuple.prototype.concat = function(wr){
  return Tuple( this[0].concat(wr[0]), this[1].concat(wr[1]) );
}
//allows merging of Tuples, as long as both the log and values are of the same semigroup.


//setoid
Tuple.prototype.equals = function(wr){
  return this[0]===wr[0] && this[1]===wr[1];
}

//???
Tuple.prototype.sequence = function(of){
  return of(this[1].chain(x=>Tuple(this[0],x)));
}

module.exports = Tuple;
},{}],13:[function(require,module,exports){
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

const aggregate2 = subject => test1 => test2 => 
  Success(a => b => subject).ap(test1(subject)).ap(test2(subject));


function curryN(n, f){
  return function _curryN(as) { return function() {
    var args = as.concat([].slice.call(arguments))
    return args.length < n?  _curryN(args)
    :      /* otherwise */   f.apply(null, args)
  }}([])
}

//not quite working
const aggregateish = (...testList) => 
  testValue => 
  testList.reduce((acc,x)=>acc.ap(x(testValue)), Success(curryN(testList.length, x=>testValue)) );

//not quite working
const aggregate = (...testList) => 
  testValue => 
  testList.traverse(test=>test(testValue), Validation.of);

/*
Array of Success/Failure returning functions, then map(ap) the value to all of them

[x=>x===3?Success(3):Failure(['not 3']),x=>x===3?Success(3):Failure(['not 3']),x=>x===3?Success(3):Failure(['not 3'])].map(x=>x(4)).sequence(Validation.of)

[x=>x===3?Success(3):Failure(['not 3']),x=>x===3?Success(3):Failure(['not 3']),x=>x===3?Success(3):Failure(['not 3'])].traverse(x=>x(4),Validation.of)




*/


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




module.exports = {
  Validation,
  Failure,
  Success,
  aggregate2,
  aggregate
};
},{"../../src/other-types/pointfree.js":15}],14:[function(require,module,exports){
function Writer(l, v) {
  if (!(this instanceof Writer)) {
    return new Writer(l,v);
  }
  this[0] = String(l).trim();//log
  this[1] = v;//value
}

Writer.of = (x) => new Writer('', x);
Writer.prototype.of = Writer.of;

Writer.prototype.chain = function(f){
  const tuple = f(this[1]);
  return new Writer(this[0].concat(' ',tuple[0]), tuple[1]);
}
Writer.prototype.map = function(f){
  return new Writer( this[0], f(this[1]) );
}
Writer.prototype.ap = function(wr){
  return Writer( this[0].concat(' ', wr[0]), this[1](wr[1]) );
}
Writer.prototype.fst = function(){return this[0]};
Writer.prototype.snd = function(){return this[1]};
Writer.prototype.swap = function(){return Writer(this[1],this[0])};


const writerize = Writer.lift = (log, fn) => x => Writer(log, fn(x));


//semigroup
Writer.prototype.concat = function(wr){
  return Writer( this[0].concat(' ',wr[0]), this[1].concat(wr[1]) );
}
//allows merging of Writers, as long as both the log and values are of the same semigroup.


//setoid
Writer.prototype.equals = function(wr){
  return this[0]===wr[0] && this[1]===wr[1];
}


Writer.prototype.sequence = function(of){
  return of(this[1].chain(x=>Writer(this[0],x)));
}

module.exports = Writer;
},{}],15:[function(require,module,exports){
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
  liftA3
};
},{}],16:[function(require,module,exports){
(function (global){
const {curry}  = require('../../src/other-types/pointfree.js');

//delay :: Integer -> Promise null
const delay = ms => new Promise(resolve => global.setTimeout(resolve, ms));
const delayR = ms => new Promise((resolve, reject) => global.setTimeout(reject, ms));
//tapDelay :: Integer -> a -> Promise a
const tapDelay = curry((ms,x) => new Promise(resolve => global.setTimeout(resolve, ms, x)));
const tapDelayR = curry((ms,x) => new Promise((resolve, reject) => global.setTimeout(reject, ms, x)));

const log = x => !console.log(x) && x;
const andLog = (...comments) => x => !console.log(x, ...comments) && x;

const deriveMap = Applicative => function (fn) {
  return this.chain(value => Applicative.of(fn(value)) );
};

const deriveAp = Applicative => function(app2) {
  return this.chain(fn => app2.chain(app2value => Applicative.of(fn(app2value)) ) );
};

//write monadic operations in do notation using generators
const doM = gen => {
    function step(value) {
        var result = gen.next(value);
        if (result.done) {
            return result.value;
        }
        return result.value.chain(step);
    }
    return step();
};
/*
var result = doM(function*() {
    var value = yield Nothing;
    var value2 = yield Maybe.of(11);
    return value + value2;
}());
*/


module.exports = {
  delay,
  delayR,
  tapDelay,
  tapDelayR,
  log,
  andLog,
  deriveMap,
  deriveAp,
  doM
};
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../src/other-types/pointfree.js":15}]},{},[1]);
