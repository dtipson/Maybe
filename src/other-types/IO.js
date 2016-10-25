function IO(fn) {
  if (!(this instanceof IO)) {
    return new IO(fn);
  }
  this.runIO = fn;//IO creates an extra control layer above a function
}

IO.of = IO.prototype.of = x => IO(_=>x);//basically the same as IO(K(x))

IO.prototype.chain = function(f) {
  return IO(_ => f(this.runIO()).runIO() );
};
//operations sequenced in next stack?
IO.prototype.fork = function(f) {
  return IO(_ => new Promise( r => window.setTimeout(()=>r(this.runIO()),0) ));
};

IO.prototype.ap = function(a) {
  return this.chain( f => a.map(f));
};

IO.prototype.map = function(f) {
  return this.chain( a => IO.of(f(a)) );
};

//?unproven/maybe not possible?
// IO.prototype.sequence = function(of) {
//   return of(IO.of).ap(of(this.runIO()));
// };

//String->IO[Array]
IO.$ = selectorString => new IO(_ => Array.from(document.querySelectorAll(selectorString)));

IO.$id = idString => new IO(_ => document.getElementById(idString));
IO.setStyle = (style, to) => node => new IO(_ => { node.style[style] = to; return node;}  );

const getNodeChildren = node => Array.from(node.children);


module.exports = IO;