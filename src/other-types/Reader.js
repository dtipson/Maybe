const {invoke}  = require('../../src/other-types/pointfree.js');


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

//ask allows you to inject the/a runtime depedency into a computation without needing to specify ahead of time what it is
Reader.ask = Reader(x=>x);
//it's super tricky when you think about how it works, because you're mapping over the value in IT, but because it's used inside a chain, you're basically exiting out of the inner value and substituting in the run() value. The inner value only survives if it's passed into that new structure 

//silly helpers
Reader.binary = fn => x => Reader.ask.map(y => fn(y, x));//specify a binary function that will call run's(y) and x
Reader.exec = x => Reader.ask.map(fn => fn(x));//for single functions
Reader.invoke = methodname => x => Reader.ask.map(invoke(methodname)).ap(Reader.of(x));//for interfaces w/ named methods
Reader.invoker = methodname => R => R.chain(x => Reader.ask.map(invoke(methodname)).ap(Reader.of(x)));//for interfaces w/ named methods
Reader.run = x => R => R.run(x); 

module.exports = Reader;

//really useful case: pass an interface in later on
//Reader.of(6).chain(x=>Reader.ask.map(lib=>lib.increment(x))).run({increment:x=>x+1});

//invoke a method on an interface to be passed in later!
//Reader.of(6).chain(Reader.invoke('increment')).run({increment:x=>x+1})