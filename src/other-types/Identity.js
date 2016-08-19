function Identity(v) {
  if (!(this instanceof Identity)) {
    return new Identity(v);
  }
  this.value = v;
}

Identity.prototype.of = x => new Identity(x);
Identity.of = Identity.prototype.of;

Identity.prototype.map = function(f) {
  return new Identity(f(this.value));
};
Identity.prototype.ap = function(app) {
  return app.map(this.value);
};
Identity.prototype.sequence = function(of){
  return this.value.map(Identity.of); 
};
Identity.prototype.chain = function(f) {
  return f(this.value);
};
Identity.prototype.get = function() {
  return this.value;
};
Identity.prototype.equals = function(that){
  return that instanceof Identity && that.value === this.value;
};


module.exports = Identity;