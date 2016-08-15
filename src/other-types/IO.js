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