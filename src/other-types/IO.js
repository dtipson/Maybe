/*
const IO = fn =>({
  runIO: fn,//run the effect
  map: f => IO( a => f(fn(a)) ),//transform the value
  chain: f => IO( _ => f(fn()).runIO() ),//transform value into another pure operation
  fork: _ => IO(x => new Promise(r => window.setTimeout(_ => r(fn(x)), 0) ))//fork the process!
});
IO.of = x => IO(_ => x);
IO.$ = selectors => IO(_=>Array.from(document.querySelectorAll(selectors)));

//IO(_=>document.baseURI).map(x=>x.replace(/\//g,' :P ')).chain(x=>IO(_=>document.body.innerHTML=x))

//const getMouseClickPos = IO(e=>e).map(e=>e.clientX ).chain(x=>IO(_=>document.body.innerHTML=x))
//x=>IO.of(x).map(e=>e.clientX ).chain().chain(x=>IO(_=>document.body.innerHTML=x)).runIO()

document.addEventListener('click', x=>IO.of(x).map(e=>e.clientX ).chain(x=>IO(_=>document.body.innerHTML=x)).runIO());
*/


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
IO.prototype.sequence = function(of) {
  return of(this.map());
};

//String->IO[Array]
IO.$ = selectorString => new IO(_ => Array.from(document.querySelectorAll(selectorString)));

const getNodeChildren = node => Array.from(node.children);


module.exports = IO;