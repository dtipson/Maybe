//https://drboolean.gitbooks.io/mostly-adequate-guide/content/ch8.html#a-spot-of-theory

const {map, chain}  = require('../../src/other-types/pointfree.js');

//is this a poor-man's FunctorT interface? Yep. TypeT interfaces are more powerful, this works tho
const Compose = function(f_g_x) {
  if (!(this instanceof Compose)) {
    return new Compose(f_g_x);
  }
  this.decompose = f_g_x;
};

Compose.prototype.map = function(f) {
  return new Compose(map(map(f), this.decompose));
};
Compose.prototype.mapChain = function(f) {
  return new Compose(map(chain(f), this.decompose));
};
Compose.dec = C => C.decompose;

module.exports = Compose;


/* 

FL version at https://github.com/fantasyland/fantasy-land#traversable

var Compose = function(c) {
  this.c = c;
};

Compose.of = function(x) {
  return new Compose(F.of(G.of(x)));
};

Compose.prototype.ap = function(x) {
  return new Compose(this.c.map(u => y => u.ap(y)).ap(x.c));
};

Compose.prototype.map = function(f) {
  return new Compose(this.c.map(y => y.map(f)));
};

*/