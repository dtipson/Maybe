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