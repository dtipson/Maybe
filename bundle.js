(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./src/other-types/Array-helpers.js');
require('./src/other-types/Promise-helpers.js');

const Writer = require('./src/other-types/Writer.js');
const Reader = require('./src/other-types/Reader.js');
const IO = require('./src/other-types/IO.js');

Object.assign(
  window, 
  require('./src/Maybe.js'),
  {Reader,Writer,IO},
  require('./src/other-types/pointfree.js')
);
},{"./src/Maybe.js":2,"./src/other-types/Array-helpers.js":3,"./src/other-types/IO.js":4,"./src/other-types/Promise-helpers.js":5,"./src/other-types/Reader.js":6,"./src/other-types/Writer.js":7,"./src/other-types/pointfree.js":8}],2:[function(require,module,exports){
//We only ever need one "Nothing" so we'll define the type, create the one instance, and return it. We could have just created an object with 
//all these methods on it, but then it wouldn't log as nicely/clearly
const Nothing = (function(){
  const Nothing = function(){};
  Nothing.prototype.ap = Nothing.prototype.chain = Nothing.prototype.map = Nothing.prototype.filter = function(){ return this; };
  Nothing.prototype.sequence = function(of){ return of(this); };//flips Nothing insde a type, i.e.: Type[Nothing]
  Nothing.prototype.traverse = function(fn, of){ return of(this); };//same as above, just ignores the map fn
  Nothing.prototype.reduce = (f, x) => x,//binary function is ignored, the accumulator returned
  Nothing.prototype.getOrElse = Nothing.prototype.orElse = Nothing.prototype.concat = x => x;//just returns the provided value
  Nothing.prototype.cata = ({Nothing}) => Nothing();  //not the Nothing type constructor here, btw, a prop named "Nothing" defining a nullary function!
  Nothing.prototype.equals = function(y){return y==this;};//setoid
  Nothing.prototype.toString = _ => 'Nothing';
  Nothing.prototype.toBoolean = _ => false;//reduce a Nothing to false
  Nothing.prototype[Symbol.toPrimitive] = function(hint){ return hint=='string' ? "" : 0; };//define some behavior for coercion: empty string for string coercion, 0 for number coercion
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
Just.prototype.map = function(f){ return new Just(f(this.value)); };//transform the inner value
Just.prototype.ap = function(b){ return b.map(this.value); };//if the inner value is a function, apply a value to it
Just.prototype.chain = function(f){ return f(this.value); };//transform the inner value, assuming the function returns Just/Nothing
Just.prototype.sequence = function(of){ return this.value.map(Just); };//flip an inner type with the outer Just
Just.prototype.traverse = function(fn, of){ return this.map(fn).sequence(of); };//transform the inner value (resulting in an inner type) then flip that type outside
Just.prototype.toString = function(){ return `Just[${this.value}]`; };
Just.prototype.reduce = function(fn, acc) { return fn(acc, this.value); };//binary function + accumulator
Just.prototype.filter = function(fn){ return this.chain(x=> fn(x)? this : Nothing ); };//test the inner value with a function

//assuming that the inner value has a concat method, concat it with another Just. Falls back to + for strings and numbers
Just.prototype.concat = function(b){
  return b.value && !Maybe.isNull(b.value) ? Just(this.value.concat ? this.value.concat(b.value) : this.value + b.value) : this 
};
Just.prototype.equals = function(y){ return y.value === this.value; };//strictly compare the inner values
Just.prototype[Symbol.toPrimitive] = Just.prototype.getOrElse = function(){ return this.value; };//extract the inner value when forcibly coerced to deliver a value
Just.prototype.orElse = function(){ return this; }//does nothing in the Just case
Just.prototype.cata = function({Just}){ return Just(this.value) };//calls the function defined in prop "Just" with the inner value
Just.prototype.toBoolean = _ => true;//reduce a Just to true. Useful in filters
Just.prototype.toJSON = function(){ return `{"type":"Maybe.Just","value":${JSON.stringify(this.value)}}`; };

//we're not strictly defining Just and Nothing as subtypes of Maybe here, but we DO want to have a Maybe interface for more abstract usages
const Maybe = {
  of: x => new Just(x),//pointed interface to create the type (Just(9)/Maybe.of are synonymous )
  empty: _ => Nothing,//calling empty returns a Nothing
  isNull: x=> x===null || x===undefined,
  toBoolean: m => m!==Nothing,//reduce a passed in Just[any value]/Nothing value to true or false, useful for filters
  fromNullable: x=> Maybe.isNull(x) ? Nothing : Just(x),
  maybe: function(nothingVal, justFn, m) {//sort of a disjunctive map/reduce: apply a unary function OR return a fallback value
    return m.reduce(function(_, x) {
      return justFn(x);
    }, nothingVal);
  }
};

module.exports = {
  Maybe,
  Just,
  Nothing
};
},{}],3:[function(require,module,exports){
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
IO.prototype.fork = function(f) {
  return IO(() => window.setTimeout(()=>this.runUnsafe(),0) );
};

IO.prototype.ap = function(a) {
  return this.chain((f) => a.map(f));
};

IO.prototype.map = function(f) {
  return this.chain((a) => IO.of(f(a)) );
};

module.exports = IO;
},{}],5:[function(require,module,exports){
Promise.prototype.of = Promise.resolve;
Promise.prototype.map = function(f){
  return this.then(x => f(x));
};
Promise.prototype.chain = Promise.prototype.then;
Promise.prototype.ap = function(that){//mostly a copy of the parallelization logic that was necessary for folktale's Task.ap
  return new Promise((resolve, reject) => {
    let func, 
        funcLoaded = false,
        val, 
        valLoaded = false,
        rejected = false,
        allState;

    const guardReject = x => {
      if (!rejected){
        rejected = true;
        return reject(x);
      }
    };

    const guardResolve = setter => x => {
      if (rejected) {
        return;
      }

      setter(x);

      if (funcLoaded && valLoaded) {
        return resolve(func(val));
      } else {
        return x;
      }
    };

    const guardThis = guardResolve(fn => {
      funcLoaded = true;
      func = fn;
    });

    const guardThat = guardResolve(x => {
      valLoaded = true;
      val = x;
    });

    const thisState = this.then(guardThis, guardReject)
    const thatState = that.then(guardThat, guardReject);

  });
};
Promise.prototype.sequence = function(point){
  return point(this);
};
Promise.prototype.traverse = function(f, point){
  return this.map(f).sequence(point);
};
Promise.of = x => Promise.resolve(x);
},{}],6:[function(require,module,exports){
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

Reader.prototype.of = function(a) {
  return new Reader( _ => a );
};
Reader.of = Reader.prototype.of;

Reader.ask = Reader(x=>x);//ask allows you to inject the/a runtime depedency into a computation without needing to specify ahead of time what it is

module.exports = Reader;
},{}],7:[function(require,module,exports){
function Writer(l, v) {
  if (!(this instanceof Writer)) {
    return new Writer(l,v);
  }
  this[0] = String(l||'').trim();//log
  this[1] = v;//value
}

Writer.of = (x) => new Writer(x, x);
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

module.exports = Writer;
},{}],8:[function(require,module,exports){
const compose  = (fn, ...rest) =>
  rest.length === 0 ?
    (fn||(x=>x)) :
    (...args) => fn(compose(...rest)(...args));
const curry = (f, ...args) => (f.length <= args.length) ? f(...args) : (...more) => curry(f, ...args, ...more);

const ap = curry((A,A2) => A.ap(A2));
const map = curry((f,F) => F.map(f));
const chain = curry((f, M) => M.chain(f));
const liftA2 = curry((f, A1, A2) => F1.map(f).ap(A2));
const liftA3 = curry((f, A1, A2, A3) => A1.map(f).ap(A2).ap(A3));


module.exports = {
  compose,
  curry,
  ap,
  map,
  chain,
  liftA2,
  liftA3
}
},{}]},{},[1]);
