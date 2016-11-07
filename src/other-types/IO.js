const Task  = require('../../src/other-types/Task.js');

const logFn = fn => {
  if(fn.name){
    return fn.name
  }else{
    let stringFn = fn.toString().replace(/\s\s+/g, ' ');
    return stringFn.length>20 ?
      `(${stringFn.replace(/(=>)(.*)/, "$1 ...")})` :
      `(${stringFn})`
  }
};

function IO(fn, annotation) {
  if (!(this instanceof IO)) {
    return new IO(fn, annotation);
  }
  this.runIO = fn;//IO creates an extra control layer above a function
  this.computation = annotation ? annotation : logFn(fn);
}

IO.of = IO.prototype.of = x => IO(_=>x, `() => ${x}`);//basically the same as IO(K(x))

IO.prototype.chain = function(f) {
  return IO(_ => f(this.runIO()).runIO() , `${this.computation} |> ${logFn(f)}`);
};
//operations sequenced in next stack?
IO.prototype.fork = function(f) {
  return IO(_ => new Promise( r => window.setTimeout(()=>r(this.runIO()),0) ));
};

IO.prototype.ap = function(a) {
  return this.chain( f => a.map(f));
};

IO.prototype.map = function(f) {
  return new IO(_=>f(this.runIO()), `${this.computation} |> ${logFn(f)}`);
};

IO.prototype.toTask = function(f) {
  return new Task((rej, res) => res(this.runIO()));
};

//?unproven/maybe not possible?
// IO.prototype.sequence = function(of) {
//   return of(IO.of).ap(of(this.runIO()));
// };

//String->IO[Array]
IO.$ = selectorString => new IO(_ => Array.from(document.querySelectorAll(selectorString)));

IO.$id = idString => new IO(_ => document.getElementById(idString));
IO.setStyle = (style, to) => node => new IO(_ => { node.style[style] = to; return node;}  );
IO.setAttr = (attr, to) => node => new IO(_ => { node[attr] = to; return node;}  );

const getNodeChildren = node => Array.from(node.children);


module.exports = IO;