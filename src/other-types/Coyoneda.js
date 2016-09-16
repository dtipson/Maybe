const {I}  = require('../../src/other-types/pointfree.js');

function Coyoneda(x, fn) {
  if (!(this instanceof Coyoneda)) {
    return new Coyoneda(x, fn);
  }
  Object.assign(this, {x,fn});
}

Coyoneda.prototype.map = function(f){
    return Coyoneda(this.x, (...args) => f(this.fn(...args)) );
};

Coyoneda.prototype.contramap = function(f){
    return Coyoneda(this.x, compose(this.fn, f));
};

Coyoneda.prototype.dimap = function(f, g){
    return Coyoneda(this.x, compose(g, this.fn, f));
};

//if the value actually has a native map method...
Coyoneda.prototype.lower = function(){
    return this.x.map(this.fn);
};

//if not, but it has an inner value at .x
Coyoneda.prototype.run = function(){
    return this.fn(this.x);
};

Coyoneda.lift = x => Coyoneda(x, I);

module.exports = Coyoneda;
