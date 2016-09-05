function Const(value) {
  if (!(this instanceof Const)) {
    return new Const(value);
  }
  this.x = value;
}
Const.of = x => new Const(x);

Const.prototype.concat = function(y) {
    return new Const(this.x.concat(y.x));
};

Const.prototype.ap = function(fa) {
    return this.concat(fa);
};

Const.prototype.map = function() {
  return new Const(this.x);
};

module.exports = Const;

/*

  reduce is then 
  .prototype = function(f, acc) {
    const thisAcc = x => Const(acc);
    Const.prototype.ap = function(b) {
      return new Const(f(this.x, b.x));
    };
    return this.map(x => new Const(x)).sequence(thisAcc).x; 
  }

*/