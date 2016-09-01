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


Reader.ask = Reader(x=>x);//ask allows you to inject the/a runtime depedency into a computation without needing to specify ahead of time what it is

//silly helper
Reader.binary = fn => x => Reader.ask.map(y => fn(y, x));
Reader.exec = x => Reader.ask.map(fn => fn(x));
Reader.invoke = methodname => x => Reader.ask.map(invoke(methodname)).ap(Reader.of(x));

module.exports = Reader;

//really useful case: pass an interface in later on
//Reader.of(6).chain(x=>Reader.ask.map(lib=>lib.increment(x))).run({increment:x=>x+1});

//invoke a method on an interface to be passed in later!
//Reader.of(6).chain(Reader.invoke('increment')).run({increment:x=>x+1})