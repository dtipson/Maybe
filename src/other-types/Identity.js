const {I}  = require('../../src/other-types/pointfree.js');

function Identity(v) {
  if (!(this instanceof Identity)) {
    return new Identity(v);
  }
  this.x = v;
}

Identity.prototype.of = x => new Identity(x);
Identity.of = Identity.prototype.of;
Identity.prototype.toString = function() {
  return `Identity[${this.x}]`
};
Identity.prototype.map = function(f) {
  return new Identity(f(this.x));
};
Identity.prototype.fold = function(f) {
  return f(x);
};
Identity.prototype.ap = function(ap2) {
  return ap2.map(this.x);
};
Identity.prototype.flap = function(ap2) {
  return new Identity(ap2.x(this.x));
};
Identity.prototype.ap2 = function(b) {
  return new Identity(b.x(this.x));
};


Identity.prototype.sequence = function(of){
  return this.x.map(Identity.of);//we use sequence when an inner type exists that has a map method, so returning it with ITS value wrapped in Id is sufficient
};
Identity.prototype.traverse = function(f, of){
  return this.map(f).sequence(of);//transform, then sequence
};

//same result, different derivation
Identity.prototype.traverse2 = function(f, of){
  return f(this.x).map(Identity);
};
Identity.prototype.sequence2 = function(of){
  return this.traverse(I);
};




//fold and chain are the same thing for Identity!
Identity.prototype.chain = 
Identity.prototype.fold = function(f) {
  return f(this.x);
};
Identity.prototype.reduce = function(f, acc) {
  return f(acc, this.x);
};
Identity.prototype.equals = function(that){
  return that instanceof Identity && that.x === this.x;
};

//comonad
Identity.prototype.extend = function(f) {
  return Identity(f(this));//function is given the entire type, returns a regular value, which is put back in the type
};
Identity.prototype.flatten = Identity.prototype.extract = function(){
  return this.x;
};
Identity.prototype.duplicate = function(){
  return this.extend(I)
};

//chainRec
Identity.prototype.chainRec = function(f, i) {
    let state = { done: false, value: i};
    const next = v => ({ done: false, value: v });
    const done = v => ({ done: true, value: v });
    while (state.done === false) {
      state = f(next, done, state.value).extract();
    }
    return Identity.of(state.value);
};
Identity.chainRec = Identity.prototype.chainRec;
//Identity.chainRec((next, done, x) => x === 0 ? Identity.of(done(x)) : Identity.of(next(x - 1)), 5)

module.exports = Identity;